import { Controller, eventListener, type ReactiveElement } from '@a11d/lit'
import { NavigabilityController } from '@3mo/navigability'
import { Selectability, SelectabilityController, SelectabilityInteraction } from '@3mo/selectability'

/**
 * Which ARIA pattern the group announces. Derived from how it can be selected rather than configured —
 * see {@link SelectionGroupController.pattern} for the rule and why it is one.
 */
export enum SelectionGroupPattern {
	/** One of several and never none: a `radiogroup` of `radio`s. */
	Radio = 'radio',
	/** Independent, or one-of-several-or-none: a `group` of `aria-pressed` buttons. */
	Toggle = 'toggle',
	/** Nothing is selected at all: a `toolbar` of commands sharing one tab stop. */
	Toolbar = 'toolbar',
}

/** What a pattern is, once it is chosen: two roles and one rule. */
export interface SelectionPatternRules {
	readonly hostRole: string
	/** Written onto items that carry no control of their own. `button` explicitly even where the item
	 * already is one: the state it carries is only valid on a role that takes it, and an item may be any
	 * element at all. */
	readonly itemRole?: string
	/** Whether activating the selected item again clears it, rather than selecting it once more. */
	readonly clearsOnReactivation: boolean
}

/**
 * What the group needs of an item. Every member is optional but the element itself: a plain
 * `<button value='cash'>` satisfies it, and so do `mo-chip` and `mo-selectable-button`.
 *
 * The contract is not that an item *be* the control — a removable chip carries two of them. It is that
 * the group writes the state and the pattern, and the item renders them wherever its control is. An item
 * with a `selected` property does that rendering itself, and asks before it acts by dispatching a
 * cancelable `requestSelect`; an item without one is a plain control the group stamps and activates.
 */
export interface SelectionGroupItem extends HTMLElement {
	value?: string
	selected?: boolean
	selectable?: boolean
	readonly disabled?: boolean
	/** Written by the group, so an item that renders its own control announces the group's pattern on it. */
	selectionPattern?: SelectionGroupPattern
}

export interface SelectionGroupControllerOptions<T extends SelectionGroupItem> {
	/** The items, in order. Read on every access, so hosts pass a getter. */
	readonly items: ReadonlyArray<T>
	/** `undefined` turns selection off, which is what a row of commands is. */
	readonly selectability?: Selectability
	/** Re-activating the selected item clears it. Also decides the pattern — see {@link SelectionGroupController.pattern}. */
	readonly deselectable?: boolean
	/** The host's own selection. Given, the host owns the state and commits it in `handleChange`. */
	readonly selection?: ReadonlyArray<T>
	readonly handleChange?: (selection: ReadonlyArray<T>) => void
}

/**
 * A set of children sharing one selection and one tab stop — a question and its answers, a segmented
 * control, a row of filters, a set of chips.
 *
 * ```ts
 * readonly selectionGroup = new SelectionGroupController(this, host => ({
 *   get items() { return host.items },
 *   get selectability() { return host.selectability },
 *   get selection() { return host.selectionFromValue },
 *   handleChange: selection => { ... },
 * }))
 * ```
 *
 * It owns almost nothing: {@link SelectabilityController} keeps the selection rules and the ARIA state,
 * {@link NavigabilityController} the cursor — the roving tab stop, the arrows, Home and End, typeahead.
 * What is left is what only a group has: choosing the pattern, registering items nothing rendered, and
 * turning an activation into a selection.
 *
 * The two registries are deliberately not the same one. Navigability holds every item, because the
 * cursor is the same for all of them. Selectability holds only the items that do *not* render their own
 * state, because its registry is precisely what it stamps — and an item whose control lives in a shadow
 * root must not have a role or a state written onto its host.
 */
export class SelectionGroupController<T extends SelectionGroupItem = SelectionGroupItem, THost extends ReactiveElement = ReactiveElement> extends Controller {
	private readonly navigability: NavigabilityController<T>
	private readonly selectability: SelectabilityController<T>

	protected readonly options: SelectionGroupControllerOptions<T>

	constructor(
		protected override readonly host: THost,
		options: SelectionGroupControllerOptions<T> | ((host: THost) => SelectionGroupControllerOptions<T>)
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this
		this.navigability = new NavigabilityController<T>(host, {
			get items() { return controller.items },
			isNavigable: item => !item.disabled,
			// Every arrow moves: a set wraps, and the APG's radio group uses all four either way.
			orientation: 'both',
			wrap: true,
		})
		this.selectability = new SelectabilityController<T>(host, {
			get selectability() { return controller.options.selectability },
			get items() { return controller.items },
			get selection() { return controller.options.selection },
			handleChange: ({ selection }) => controller.options.handleChange?.(selection),
			// The group resolves activations itself: its items are elements it was handed rather than ones
			// it rendered, and what an activation means depends on the pattern.
			interaction: SelectabilityInteraction.Manual,
		})
	}

	/**
	 * | pattern | host | item | re-activating |
	 * |---|---|---|---|
	 * | radio | `radiogroup` | `radio`, so `aria-checked` | selects again |
	 * | toggle | `group` | `button`, so `aria-pressed` | clears |
	 * | toolbar | `toolbar` | — | — |
	 *
	 * The table is the implementation rather than a comment above three switches that each re-encode one
	 * of its columns.
	 */
	private static readonly rulesByPattern = new Map<SelectionGroupPattern, SelectionPatternRules>([
		[SelectionGroupPattern.Radio, { hostRole: 'radiogroup', itemRole: 'radio', clearsOnReactivation: false }],
		[SelectionGroupPattern.Toggle, { hostRole: 'group', itemRole: 'button', clearsOnReactivation: true }],
		[SelectionGroupPattern.Toolbar, { hostRole: 'toolbar', clearsOnReactivation: false }],
	])

	private focused?: { readonly item: T, readonly index: number }
	private lastItemRole?: string

	get items() { return this.options.items }

	private get multiple() { return this.options.selectability === Selectability.Multiple }

	private get deselectable() { return this.options.deselectable ?? false }

	/**
	 * Which of {@link SelectionGroupController.rulesByPattern} applies: no selectability is a toolbar,
	 * single that cannot be emptied is a radio group, and everything else is a set of toggles.
	 *
	 * Derived rather than configured, because the two are the same fact said twice. A set where exactly
	 * one is always chosen *is* a radio group — the APG says so — and a single selection that can be
	 * emptied is not one, since no radio group can be cleared by clicking. That second row is Ark UI's
	 * deselectable toggle group, and calling it what it is settles the vocabulary.
	 *
	 * Arrows move without selecting in every pattern, which is the APG's own exception for a radio group
	 * inside a toolbar and the only behaviour that stays honest when an item can be a link or carry a
	 * second action of its own.
	 */
	get pattern() {
		return !this.options.selectability ? SelectionGroupPattern.Toolbar
			: this.options.selectability === Selectability.Single && !this.deselectable ? SelectionGroupPattern.Radio
				: SelectionGroupPattern.Toggle
	}

	/** The rules of the pattern this group currently is. */
	get rules() { return SelectionGroupController.rulesByPattern.get(this.pattern)! }

	get hostRole() { return this.rules.hostRole }

	/** The item focus is currently in, descending through shadow roots — `:focus-within` does not cross
	 * the boundary reliably in every engine, and an item may carry its control inside one. */
	get activeItem(): T | undefined {
		let active: Element | null = this.host.ownerDocument.activeElement
		while (active) {
			const item = this.items.find(item => item === active)
			if (item) {
				return item
			}
			active = active.shadowRoot?.activeElement ?? null
		}
		return undefined
	}

	/** An item that renders its own control, and therefore its own state, and therefore asks first. */
	private rendersOwnState(item: T) {
		return 'selected' in item
	}

	override hostUpdated() {
		this.sync()
	}

	/** Called by the host when its items change — a slot change, or a re-render of the data behind them. */
	handleItemsChange() {
		this.restoreFocus()
		this.sync()
		this.host.requestUpdate()
	}

	private sync() {
		this.syncRegistries()
		this.host.setAttribute('role', this.hostRole)
		for (const item of this.items) {
			this.stampItem(item)
		}
		this.rememberFocus()
		// Tab lands on the selected item — but only while there is no cursor at all, since after that it
		// belongs to whoever moved it. With nothing selected navigability gives the tab stop to the first
		// navigable item on its own.
		if (this.navigability.current === undefined) {
			const selected = this.items.find(item => !item.disabled && this.selectability.isSelected(item))
			if (selected) {
				this.navigability.goTo(selected, { method: 'programmatic' })
			}
		}
	}

	/** The items are the host's markup, so nothing rendered them and nothing registered them. */
	private syncRegistries() {
		const items = this.items
		const options = (item: T) => ({ index: items.indexOf(item), data: item, disabled: !!item.disabled })
		this.navigability.indexability.setItems(items, options)
		this.selectability.indexability.setItems(items.filter(item => !this.rendersOwnState(item)), options)
	}

	private stampItem(item: T) {
		if (!this.rendersOwnState(item)) {
			// Everything else a plain item needs — the ARIA state this role calls for, `data-selectability`
			// — is written by the selectability controller, which this one hands the role to.
			const role = this.rules.itemRole
			if (role) {
				item.setAttribute('role', role)
			} else if (this.lastItemRole && item.getAttribute('role') === this.lastItemRole) {
				item.removeAttribute('role')
			}
			this.lastItemRole = role
			return
		}
		item.selectionPattern = this.pattern
		// A group with no selection has no opinion about an item's own: a toggle inside a toolbar is a
		// valid thing to be, and whoever put it there owns it.
		if (!this.selectability.enabled) {
			return
		}
		if ('selectable' in item) {
			item.selectable = true
		}
		item.selected = this.selectability.isSelected(item)
	}

	private itemOf(event: Event) {
		const path = event.composedPath()
		return this.items.find(item => path.includes(item))
	}

	/**
	 * An item asking to select itself. The group refuses it and rules instead — which is the whole point:
	 * one writer, so the item's own `change` goes on meaning only what it says, and a binding on the item
	 * never observes a state the group is about to overrule.
	 */
	@eventListener('requestSelect')
	protected handleRequestSelect(event: CustomEvent<boolean>) {
		const item = this.itemOf(event)
		if (!item || item.disabled || !this.options.selectability) {
			return
		}
		event.preventDefault()
		this.activate(item, event)
	}

	/** A plain element has nothing to ask with, so its activation is its click. */
	@eventListener('click')
	protected handleClick(event: MouseEvent) {
		const item = this.itemOf(event)
		if (!item || item.disabled || !this.options.selectability || this.rendersOwnState(item)) {
			return
		}
		this.activate(item, event)
	}

	private activate(item: T, event: Event) {
		// A radio group selects again; a set of toggles clears — and `preserve` is the separate fact that an
		// item of a multiple selection speaks only for itself.
		const selected = this.rules.clearsOnReactivation && this.selectability.isSelected(item) ? false : undefined
		this.selectability.select(item, { selected, preserve: this.multiple, event })
		this.sync()
	}

	@eventListener('focusin')
	protected rememberFocus() {
		const item = this.activeItem
		if (item) {
			this.focused = { item, index: this.items.indexOf(item) }
		}
	}

	/**
	 * The item that had focus is gone — removed, filtered away, refetched — and focus went with it. It is
	 * handed to whatever took its place rather than left at the top of the document.
	 *
	 * The cursor itself needs no rescuing: navigability reconciles it to the nearest navigable item on its
	 * own. Only focus does, because navigability moves focus solely when focus is already inside the host,
	 * which it no longer is.
	 */
	private restoreFocus() {
		const focused = this.focused
		this.focused = undefined
		const document = this.host.ownerDocument
		if (!focused || this.items.includes(focused.item) || document.activeElement !== document.body) {
			return
		}
		const next = this.items[focused.index] ?? this.items[focused.index - 1]
		if (next) {
			this.syncRegistries()
			this.navigability.goTo(next, { method: 'programmatic' })
			next.focus()
		}
	}
}