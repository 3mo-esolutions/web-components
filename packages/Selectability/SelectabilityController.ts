import { Controller, type DirectiveResult, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController, type IndexabilityItem, type IndexabilityItemOptions } from '@3mo/indexability'

export enum Selectability {
	Single = 'single',
	Multiple = 'multiple',
}

export enum SelectabilityBehaviorOnItemsChange {
	/** Drops the selection entirely. */
	Reset = 'reset',
	/** Re-resolves the selection against the new items by key, so the same items stay selected across a
	 * refetch that hands back equal-but-not-identical instances. */
	Maintain = 'maintain',
	/** Leaves the selection exactly as it is, items no longer present included. */
	Prevent = 'prevent',
}

/** Who turns an event into a selection. */
export enum SelectabilityInteraction {
	/** The controller, resolving an activation through the registry — see {@link SelectabilityStrategy}. */
	Auto = 'auto',
	/** The host, through {@link SelectabilityController.select}. Modifier state is still watched, so
	 * shift-clicking a control that reports itself with a plain event keeps working. */
	Manual = 'manual',
}

/**
 * What a PLAIN activation means under {@link SelectabilityInteraction.Auto}. Modifiers are read either
 * way, and neither is consulted in single selectability.
 */
export enum SelectabilityStrategy {
	/** The selection becomes this item alone. */
	Replace = 'replace',
	/** The item is added or removed, as though it carried a checkbox. */
	Toggle = 'toggle',
}

/** How much of the SELECTABLE items the selection covers, so that unselectable ones cannot make
 * {@link All} unreachable. */
export enum SelectabilityAllState {
	None = 'none',
	/** What a tri-state control shows as indeterminate. */
	Some = 'some',
	All = 'all',
}

export interface SelectabilityItemOptions<T> extends IndexabilityItemOptions<T> {
	/** Required here, unlike the registry at large: an item that cannot say WHAT it renders cannot take
	 * part in a selection. */
	readonly data: T
}

export type SelectabilityAnchor<T> = {
	readonly item: T
	readonly selected: boolean
}

export type SelectabilitySelectOptions = {
	/** Left out, a preserving select toggles and anything else selects; a range follows its anchor. */
	readonly selected?: boolean
	/** Keep the rest of the selection: a checkbox, or a ctrl/meta activation. Multiple only. */
	readonly preserve?: boolean
	/** Apply to the whole run between the anchor and this item. Multiple only. */
	readonly range?: boolean
	/** The interaction's real event, from which `shiftKey` implies `range` and `ctrlKey`/`metaKey` imply
	 * `preserve`; explicit flags win. Pass the event that CARRIES the modifiers where there is one — a
	 * control's `change` and a synthesised click have none, and the controller then falls back on the
	 * last real input to reach the host, which is what shift-clicking a checkbox depends on. */
	readonly event?: Event
}

export type SelectabilityChange<T> = {
	readonly selection: ReadonlyArray<T>
	readonly added: ReadonlyArray<T>
	readonly removed: ReadonlyArray<T>
}

type SelectabilityModifiers = { readonly shift: boolean, readonly ctrl: boolean, readonly meta: boolean }

const noModifiers: SelectabilityModifiers = { shift: false, ctrl: false, meta: false }

/**
 * Selection — of items declared inline in a template, or of whatever the owner calls its data:
 *
 * ```ts
 * readonly selectability = new SelectabilityController<Person>(this, {
 *   selectability: Selectability.Multiple,
 *   get items() { return component.people },
 *   handleChange: ({ selection }) => this.selectionChange.dispatch([...selection]),
 * })
 * ```
 *
 * Every option is read lazily, so a value that varies with the host is passed as a getter — whose
 * `this` is the options object, which is also why the callbacks are arrows.
 *
 * The controller stores no selection of its own unless asked to: a host with a reactive property for it
 * passes that as `selection` and commits the answer in `handleChange`, so the selection lives in exactly
 * one place and neither side has to fence the other's writes.
 *
 * Identity is a `key`, not a reference, so a selection survives its items being replaced by equal ones.
 * And it is not tied to what is rendered: `items` is the owner's full ordered universe, so a range spans
 * items that were never rendered. The registry ({@link IndexabilityController}) covers the other half —
 * resolving an event to the item it landed on, and stamping state onto the elements that exist.
 */
export class SelectabilityController<T, TItemOptions extends SelectabilityItemOptions<T> = SelectabilityItemOptions<T>> extends Controller implements EventListenerObject {
	private static readonly selectedRoles = ['option', 'row', 'treeitem', 'gridcell', 'tab', 'columnheader', 'rowheader']
	private static readonly checkedRoles = ['menuitemcheckbox', 'menuitemradio', 'checkbox', 'radio', 'switch']
	private static readonly multiselectableRoles = ['listbox', 'grid', 'treegrid', 'tree', 'tablist']

	readonly indexability: IndexabilityController<T, TItemOptions>

	constructor(override readonly host: ReactiveElement, readonly options: {
		/** `undefined` turns selection off: every operation becomes a no-op, and the selection is dropped
		 * as it goes off. */
		selectability?: Selectability
		/** The owner's FULL ordered universe, not merely what is rendered. Defaults to the registry's
		 * data, which is right for a list that renders all of itself and wrong for anything paged. */
		items?: ReadonlyArray<T>
		/** Identity. Defaults to reference identity. */
		key?: (item: T) => unknown
		isSelectable?: (item: T) => boolean
		/** The host's own selection property. Given, the host owns the state and must commit the
		 * controller's answer synchronously in {@link handleChange}; left out, the controller keeps it. */
		selection?: ReadonlyArray<T>
		/** Called only when the selection actually changed, compared by key. */
		handleChange?: (change: SelectabilityChange<T>) => void
		/** What {@link handleItemsChange} does by default. Defaults to `reset`. */
		behaviorOnItemsChange?: SelectabilityBehaviorOnItemsChange
		/** Defaults to {@link SelectabilityInteraction.Auto}. */
		interaction?: SelectabilityInteraction
		/** Defaults to `replace`. */
		strategy?: SelectabilityStrategy
		/** Whether `data-selectability`, the ARIA state the item's role calls for and the host's
		 * `aria-multiselectable` are written onto the elements. Defaults to `true` — a selection nothing
		 * announces is a bug; off, for a host that reflects the selection itself. */
		stamping?: boolean
		/** Which ARIA state to write. Defaults to what the item's role calls for; a tree of checkboxes
		 * says `checked` on its `treeitem`s, which the role alone would not. */
		ariaState?: 'selected' | 'checked'
		/** A shared registry to adopt, so that an item declares itself once however many controllers
		 * read it. Read once, and expected to live on this controller's own host. */
		indexability?: IndexabilityController<T, TItemOptions>
	} = {}) {
		super(host)
		// Built from the PARAMETER and observed here rather than in a field initialiser, so neither
		// depends on where TypeScript happens to place those.
		this.indexability = options.indexability ?? new IndexabilityController<T, TItemOptions>(host)
		this.indexability.observe({ handleItemUpdated: item => this.stampItem(item, this.selectedKeys) })
	}

	private internalSelection: ReadonlyArray<T> = []
	private internalAnchor?: SelectabilityAnchor<T>
	private modifiers = noModifiers
	private lastSelectability?: Selectability
	private keyCache?: { readonly selection: ReadonlyArray<T>, readonly keys: ReadonlySet<unknown> }

	// Registered as ITSELF (an EventListenerObject) rather than as bound handlers: `Controller`'s
	// constructor adds this to its host, and lit calls `hostConnected` right there when the host is
	// already connected — before this class's field initialisers have run. A field would register
	// `undefined` and silently never listen. Prototype methods exist before construction begins.
	override hostConnected() {
		this.host.addEventListener('pointerdown', this)
		this.host.addEventListener('keydown', this)
		this.host.addEventListener('click', this)
		// A modifier released while the page is elsewhere must not stay held in the snapshot.
		window.addEventListener('keyup', this)
		window.addEventListener('blur', this)
	}

	override hostDisconnected() {
		this.host.removeEventListener('pointerdown', this)
		this.host.removeEventListener('keydown', this)
		this.host.removeEventListener('click', this)
		window.removeEventListener('keyup', this)
		window.removeEventListener('blur', this)
	}

	override hostUpdated() {
		const selectability = this.selectability
		if (selectability !== this.lastSelectability) {
			this.lastSelectability = selectability
			if (!selectability) {
				// A selection nothing can act on is a trap, so it goes off with the selectability.
				this.internalAnchor = undefined
				this.commit([])
				return
			}
		}
		// Catches a selection assigned from outside, which need not have re-rendered the items.
		this.stamp()
	}

	handleEvent(e: Event) {
		switch (e.type) {
			case 'blur':
				this.modifiers = noModifiers
				return
			case 'keyup':
				// Only ever loosens: the snapshot is SET by input that reached the host, and a stray
				// keyup elsewhere must not be able to arm a modifier the host never saw pressed.
				this.modifiers = {
					shift: this.modifiers.shift && (e as KeyboardEvent).shiftKey,
					ctrl: this.modifiers.ctrl && (e as KeyboardEvent).ctrlKey,
					meta: this.modifiers.meta && (e as KeyboardEvent).metaKey,
				}
				return
			case 'pointerdown':
			case 'keydown':
			case 'click':
				this.modifiers = SelectabilityController.modifiersOf(e) ?? this.modifiers
				break
		}
		if (this.interaction === SelectabilityInteraction.Auto) {
			if (e.type === 'click') {
				this.handleActivation(e as MouseEvent)
			}
			if (e.type === 'keydown') {
				this.handleKeyDown(e as KeyboardEvent)
			}
		}
	}

	private static modifiersOf(e: Event): SelectabilityModifiers | undefined {
		return 'shiftKey' in e
			? { shift: !!(e as MouseEvent).shiftKey, ctrl: !!(e as MouseEvent).ctrlKey, meta: !!(e as MouseEvent).metaKey }
			: undefined
	}

	private get interaction() { return this.options.interaction ?? SelectabilityInteraction.Auto }
	private get strategy() { return this.options.strategy ?? SelectabilityStrategy.Replace }
	private get stamping() { return this.options.stamping ?? true }
	private get behaviorOnItemsChange() { return this.options.behaviorOnItemsChange ?? SelectabilityBehaviorOnItemsChange.Reset }

	/** Registers an item: `<li ${controller.item({ index, data })}>`. */
	get item(): (options: TItemOptions) => DirectiveResult { return this.indexability.item }

	get selectability() { return this.options.selectability }

	get enabled() { return !!this.selectability }

	private get multiple() { return this.selectability === Selectability.Multiple }

	/** The owner's full ordered universe, rendered or not. */
	get items(): ReadonlyArray<T> { return this.options.items ?? this.indexability.data }

	get selectableItems(): ReadonlyArray<T> { return this.items.filter(item => this.isSelectable(item)) }

	get selection(): ReadonlyArray<T> { return this.options.selection ?? this.internalSelection }
	/** Replaces the selection outright — the assignment counterpart to {@link select}. It runs through
	 * the same constraints, so what is read back is not necessarily what was assigned: unselectable items
	 * are dropped, keys de-duplicated, and single selectability capped to one. */
	set selection(items: ReadonlyArray<T>) {
		if (this.enabled) {
			this.commit(items)
		}
	}

	/** Where a range extends FROM, and in which direction: an anchor left deselected makes the next range
	 * subtract. Set by every {@link select}; dropped by the bulk operations and the assignment. */
	get anchor() { return this.internalAnchor }

	get allState(): SelectabilityAllState {
		const selectable = this.selectableItems
		const keys = this.selectedKeys
		const selected = selectable.filter(item => keys.has(this.keyOf(item))).length
		return selected === 0 ? SelectabilityAllState.None
			: selected === selectable.length ? SelectabilityAllState.All
				: SelectabilityAllState.Some
	}

	keyOf(item: T) { return this.options.key?.(item) ?? item }

	isSelectable(item: T) { return this.options.isSelectable?.(item) ?? true }

	isSelected(item: T) { return this.selectedKeys.has(this.keyOf(item)) }

	private get selectedKeys(): ReadonlySet<unknown> {
		const selection = this.selection
		if (this.keyCache?.selection !== selection) {
			this.keyCache = { selection, keys: new Set(selection.map(item => this.keyOf(item))) }
		}
		return this.keyCache.keys
	}

	/**
	 * THE interaction: the flags say what the gesture MEANT, and the outcome follows from it.
	 *
	 * | gesture | multiple | single |
	 * |---|---|---|
	 * | plain | replaces the selection with this item | the same |
	 * | preserving (a checkbox, ctrl/meta) | adds or removes, leaving the rest | degrades to plain |
	 * | range (shift) | applies the anchor's state to the run between it and this item | degrades to plain |
	 *
	 * A range whose anchor no longer resolves degrades rather than guessing, and its run is taken over the
	 * selectable items, so unselectable ones are stepped over rather than dragged in.
	 */
	select(item: T, options?: SelectabilitySelectOptions) {
		if (!this.enabled || !this.isSelectable(item)) {
			return
		}
		const modifiers = (options?.event ? SelectabilityController.modifiersOf(options.event) : undefined) ?? this.modifiers
		const range = this.multiple && (options?.range ?? modifiers.shift)
		const preserve = this.multiple && (options?.preserve ?? (modifiers.ctrl || modifiers.meta))
		const selected = options?.selected ?? (preserve && !range ? !this.isSelected(item) : true)

		const run = !range ? undefined : this.runTo(item)
		const next = run
			? this.anchor!.selected
				? [...this.selection, ...run]
				: this.without(this.selection, run)
			: preserve && selected ? [...this.selection, item]
				: selected ? [item]
					: this.without(this.selection, [item])

		this.internalAnchor = { item, selected }
		this.commit(next)
	}

	/**
	 * A cursor moved onto an item, in a host that has one. With Shift held, the selection extends to it as
	 * a range; otherwise nothing happens, which is what an unmodified arrow means. One line at the host is
	 * the whole wiring, and this controller stays unaware of what moved the cursor:
	 *
	 * ```ts
	 * handleChange: change => this.selectability.follow(change.item, change.event)
	 * ```
	 */
	follow(item: T | undefined, event?: Event) {
		const modifiers = (event ? SelectabilityController.modifiersOf(event) : undefined) ?? this.modifiers
		if (item !== undefined && modifiers.shift) {
			this.select(item, { range: true, event })
		}
	}

	/** The inclusive run between the anchor and `item`, in either direction — or nothing, when there is no
	 * anchor or it has left the universe. */
	private runTo(item: T) {
		const anchor = this.anchor
		if (!anchor) {
			return undefined
		}
		const items = this.selectableItems
		const from = items.findIndex(candidate => this.keyOf(candidate) === this.keyOf(anchor.item))
		const to = items.findIndex(candidate => this.keyOf(candidate) === this.keyOf(item))
		return from === -1 || to === -1 ? undefined : items.slice(Math.min(from, to), Math.max(from, to) + 1)
	}

	private without(items: ReadonlyArray<T>, removed: ReadonlyArray<T>) {
		const keys = new Set(removed.map(item => this.keyOf(item)))
		return items.filter(item => !keys.has(this.keyOf(item)))
	}

	/** What a tri-state select-all control does when clicked: everything, unless there is already
	 * something — in which case nothing. */
	toggleAll() {
		if (this.allState === SelectabilityAllState.None) {
			this.selectAll()
		} else {
			this.deselectAll()
		}
	}

	selectAll() {
		if (this.multiple) {
			this.internalAnchor = undefined
			this.commit(this.items)
		}
	}

	deselectAll() {
		if (this.enabled) {
			this.internalAnchor = undefined
			this.commit([])
		}
	}

	/** The owner replaced its items. */
	handleItemsChange(behavior = this.behaviorOnItemsChange) {
		if (!this.enabled) {
			return
		}
		switch (behavior) {
			case SelectabilityBehaviorOnItemsChange.Reset:
				this.deselectAll()
				break
			case SelectabilityBehaviorOnItemsChange.Maintain:
				this.maintain()
				break
			case SelectabilityBehaviorOnItemsChange.Prevent:
				break
		}
	}

	/** Re-resolves selection and anchor onto the new items by key, so both point at the instances that
	 * now exist rather than at the ones that were replaced. */
	private maintain() {
		const items = this.items
		const resolve = (item: T) => {
			const key = this.keyOf(item)
			return items.find(candidate => this.keyOf(candidate) === key)
		}
		const anchor = this.internalAnchor
		if (anchor) {
			const item = resolve(anchor.item)
			this.internalAnchor = item === undefined ? undefined : { item, selected: anchor.selected }
		}
		const keys = this.selectedKeys
		this.commit(items.filter(item => keys.has(this.keyOf(item))))
	}

	/** The one place a candidate selection becomes the selection, so that the rules hold however it was
	 * arrived at: unselectable items dropped, keys de-duplicated, single selectability capped to one. */
	private constrain(items: ReadonlyArray<T>) {
		const seen = new Set<unknown>()
		const constrained = new Array<T>()
		for (const item of items) {
			const key = this.keyOf(item)
			if (this.isSelectable(item) && !seen.has(key)) {
				seen.add(key)
				constrained.push(item)
			}
		}
		return this.multiple ? constrained : constrained.slice(0, 1)
	}

	private commit(next: ReadonlyArray<T>) {
		const selection = this.constrain(next)
		const previous = this.selection
		// Compared by IDENTITY rather than by key: `maintain` re-resolves the same keys onto the instances
		// that now exist, and a selection still pointing at the replaced ones is stale even though nothing
		// joined or left it.
		if (selection.length === previous.length && selection.every((item, index) => item === previous[index])) {
			return
		}
		const previousKeys = this.selectedKeys
		const keys = new Set(selection.map(item => this.keyOf(item)))
		const added = selection.filter(item => !previousKeys.has(this.keyOf(item)))
		const removed = previous.filter(item => !keys.has(this.keyOf(item)))
		this.internalSelection = selection
		this.options.handleChange?.({ selection, added, removed })
		this.host.requestUpdate()
		this.stamp()
	}

	private stamp() {
		if (this.stamping) {
			const keys = this.selectedKeys
			for (const item of this.indexability.items) {
				this.stampItem(item, keys)
			}
			this.stampHost()
		}
	}

	private stampItem({ element, options }: IndexabilityItem<T, TItemOptions>, keys: ReadonlySet<unknown>) {
		if (!this.stamping) {
			return
		}
		const selected = keys.has(this.keyOf(options.data))
		element.dataset.selectability = selected ? 'selected' : 'unselected'
		const role = element.role ?? element.getAttribute('role') ?? ''
		// A role that has no selected state gets no attribute: an aria-selected the role does not allow is
		// read as a broken control rather than an unselected one.
		const attribute = this.options.ariaState ? `aria-${this.options.ariaState}`
			: SelectabilityController.selectedRoles.includes(role) ? 'aria-selected'
				: SelectabilityController.checkedRoles.includes(role) ? 'aria-checked'
					: undefined
		if (attribute) {
			element.setAttribute(attribute, String(selected))
		}
	}

	private stampHost() {
		const role = this.host.role ?? this.host.getAttribute('role') ?? ''
		if (SelectabilityController.multiselectableRoles.includes(role)) {
			this.host.toggleAttribute('aria-multiselectable', this.multiple)
		}
	}

	private handleActivation(e: MouseEvent) {
		const item = this.indexability.itemAt(e.composedPath())
		if (item && !item.options.disabled) {
			this.select(item.options.data, this.strategy === SelectabilityStrategy.Toggle ? { preserve: true, event: e } : { event: e })
		}
	}

	private handleKeyDown(e: KeyboardEvent) {
		if (this.multiple && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
			e.preventDefault()
			this.selectAll()
		}
	}
}