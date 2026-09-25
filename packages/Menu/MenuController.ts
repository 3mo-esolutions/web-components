import { Controller, ElementRef, eventListener, type ReactiveElement } from '@a11d/lit'
import { NavigabilityController } from '@3mo/navigability'
import { Selectability, SelectabilityController, SelectabilityInteraction } from '@3mo/selectability'
import { SelectionListItemChangeEvent } from '@3mo/list'

export interface MenuControllerOptions {
	/** Read on every access. */
	readonly items: ReadonlyArray<HTMLElement>
	readonly expanded: boolean
	readonly handleExpandedChange?: (expanded: boolean) => void
	/** For the items carrying a `selected` of their own. Undefined leaves each to itself. */
	readonly selectability?: Selectability
	/** The selected items' indices. */
	readonly value?: ReadonlyArray<number>
	readonly handleChange?: (value: Array<number>) => void
}

/**
 * The ARIA menu button pattern: a trigger announcing a menu, and the menu with real focus on its items
 * while it is open.
 *
 * ```ts
 * readonly menu = new MenuController(this, host => ({
 *   get items() { return host.items },
 *   get expanded() { return host.open },
 *   handleExpandedChange: open => host.open = open,
 * }))
 * ```
 *
 * Opening lands on the selected item. Without one, a keyboard opening lands on the first item, or the last
 * for Up and End, while a pointer opening focuses the menu itself, as native menus do. Escape, Tab, a choice
 * and focus leaving close it, returning focus to the trigger. A press outside is left to the popover showing
 * it. Items rendering their own `selected` are announced as `menuitemradio` or `menuitemcheckbox` by
 * `selectability`. Sideways arrows are left to a submenu or a menu bar.
 */
export class MenuController extends Controller {
	/** Set on a click that chooses nothing, such as one opening a submenu, to keep the menu open. */
	static readonly preventClose = Symbol('MenuController.preventClose')

	private static readonly openingKeys = ['Down', 'ArrowDown', 'Up', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown']

	readonly trigger = new ElementRef<HTMLElement>({
		updated: element => {
			element.addEventListener('keydown', this.handleTriggerKeyDown)
			element.addEventListener('pointerdown', this.handleTriggerPointerDown)
			this.stampTrigger()
		},
		disconnected: element => {
			element.removeEventListener('keydown', this.handleTriggerKeyDown)
			element.removeEventListener('pointerdown', this.handleTriggerPointerDown)
			element.removeAttribute('aria-haspopup')
			element.removeAttribute('aria-expanded')
		},
	})

	/** Holds focus while no item is active. Without it, the host is the menu. */
	readonly menu = new ElementRef<HTMLElement>({
		updated: () => this.stampMenu(),
	})

	private readonly navigability: NavigabilityController<HTMLElement>
	private readonly selectability: SelectabilityController<HTMLElement>

	protected readonly options: MenuControllerOptions

	constructor(protected override readonly host: ReactiveElement, options: MenuControllerOptions | ((host: ReactiveElement) => MenuControllerOptions)) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this
		this.navigability = new NavigabilityController<HTMLElement>(host, {
			get items() { return controller.items },
			wrap: true,
			typeahead: true,
			handleKeyDown: event => controller.handleKeyDown(event),
		})
		this.selectability = new SelectabilityController<HTMLElement>(host, {
			get selectability() { return controller.options.selectability },
			get items() { return controller.items },
			get selection() { return controller.selection },
			handleChange: ({ selection }) => {
				const value = selection.map(item => controller.items.indexOf(item))
				controller.syncItems(selection)
				controller.appliedValue = value
				controller.options.handleChange?.(value)
			},
			interaction: SelectabilityInteraction.Manual,
			stamping: false,
		})
	}

	private readonly checkable = new WeakSet<HTMLElement>()
	private appliedValue?: ReadonlyArray<number>
	private expanded = false
	private landing = false
	private landsOnLast = false
	private landsByKeyboard = false
	private triggerInput?: 'keyboard' | 'pointer'
	private readonly resizeObserver = new ResizeObserver(() => this.land())

	private get items() { return this.options.items }

	private get selection() {
		return (this.options.value ?? [])
			.map(index => this.items[index])
			.filter((item): item is HTMLElement => !!item)
	}

	override hostDisconnected() {
		this.resizeObserver.disconnect()
	}

	/** Read before the render that hides the menu, as the browser drops focus from hidden elements on its next style recalculation. */
	private returnsFocus = false

	override hostUpdate() {
		if (!this.options.expanded && this.expanded) {
			const active = activeElement()
			this.returnsFocus = !!active && this.contains(active)
		}
	}

	override hostUpdated() {
		this.sync()
		this.stampMenu()
		this.stampTrigger()
		if (this.options.expanded && !this.expanded) {
			// Firefox shows script focus as keyboard focus only if the previously focused element showed it
			this.landsByKeyboard = this.triggerInput ? this.triggerInput === 'keyboard' : !!activeElement()?.matches(':focus-visible')
			this.landing = true
			this.land()
		} else if (!this.options.expanded && this.expanded) {
			this.landing = false
			this.landsOnLast = false
			this.landsByKeyboard = false
			this.triggerInput = undefined
			this.resizeObserver.disconnect()
			this.navigability.clear()
			if (this.returnsFocus) {
				this.returnsFocus = false
				this.trigger.value?.focus()
			}
		}
		this.expanded = this.options.expanded
	}

	handleItemsChange() {
		this.appliedValue = undefined
		this.sync()
		this.land()
	}

	private sync() {
		const items = this.items
		for (const item of items) {
			this.stampRole(item)
		}
		this.navigability.indexability.setItems(items, (item, index) => ({ index, data: item, disabled: isDisabled(item) }))
		// Applied once per value: on every update it would overrule items whose `selected` their consumer binds
		const value = this.options.value
		if (value && this.options.selectability && value !== this.appliedValue) {
			this.appliedValue = value
			this.syncItems(this.selection)
		}
	}

	private stampRole(item: HTMLElement) {
		const role = item.getAttribute('role')
		if (role === 'listitem' || !role) {
			item.setAttribute('role', 'menuitem')
		} else if ('selected' in item && (role === 'menuitem' || this.checkable.has(item))) {
			this.checkable.add(item)
			item.setAttribute('role', !this.options.selectability ? 'menuitem'
				: this.options.selectability === Selectability.Single ? 'menuitemradio' : 'menuitemcheckbox')
		}
		const checkable = ['menuitemcheckbox', 'menuitemradio'].includes(item.getAttribute('role')!)
		if (checkable && 'selected' in item) {
			const selected = (item as HTMLElement & { selected: unknown }).selected
			item.setAttribute('aria-checked', selected === 'indeterminate' ? 'mixed' : String(!!selected))
		}
	}

	private get menuElement() {
		return this.menu.value ?? this.host as unknown as HTMLElement
	}

	private stampMenu() {
		const menu = this.menuElement
		menu.setAttribute('role', 'menu')
		menu.ariaLabelledByElements = this.trigger.value ? [this.trigger.value] : null
		if (!menu.hasAttribute('tabindex')) {
			menu.tabIndex = -1
		}
	}

	private stampTrigger() {
		const trigger = this.trigger.value
		trigger?.setAttribute('aria-haspopup', 'menu')
		trigger?.setAttribute('aria-expanded', String(this.options.expanded))
	}

	/** Waits until the target can take focus, which a popover allows only after the host's update. */
	private land() {
		if (!this.landing || !this.options.expanded) {
			return
		}
		const items = this.items.filter(item => !isDisabled(item))
		const item = items.find(item => (item as HTMLElement & { selected?: unknown }).selected === true)
			?? (!this.landsByKeyboard ? undefined : this.landsOnLast ? items.at(-1) : items[0])
		if (!item && this.landsByKeyboard) {
			return
		}
		const target = item ?? this.menuElement
		if (!target.checkVisibility()) {
			this.resizeObserver.disconnect()
			this.resizeObserver.observe(target)
			return
		}
		this.landing = false
		this.landsOnLast = false
		this.landsByKeyboard = false
		this.resizeObserver.disconnect()
		if (item) {
			this.navigability.goTo(item, { method: 'programmatic' })
		}
		target.focus({ preventScroll: true })
	}

	/** A popover's toggle arrives before the next frame, unlike a resize. */
	@eventListener({ type: 'toggle', target(this: MenuController) { return this.host.renderRoot }, options: { capture: true } })
	protected handleToggle() {
		this.land()
	}

	private readonly handleTriggerPointerDown = () => this.triggerInput = 'pointer'

	private readonly handleTriggerKeyDown = (event: KeyboardEvent) => {
		this.triggerInput = 'keyboard'
		// A key already claimed around the trigger, such as a menu bar's Home and End, opens nothing
		if (event.defaultPrevented || event.ctrlKey || event.shiftKey || event.composedPath().some(target => target instanceof Element && target.role === 'menu')) {
			return
		}
		if (!this.options.expanded && MenuController.openingKeys.includes(event.key)) {
			event.preventDefault()
			event.stopPropagation()
			this.landsOnLast = ['Up', 'ArrowUp', 'End'].includes(event.key)
			this.options.handleExpandedChange?.(true)
		} else if (this.options.expanded && event.key === 'Tab') {
			event.stopPropagation()
			this.options.handleExpandedChange?.(false)
		}
	}

	private handleKeyDown(event: KeyboardEvent) {
		const current = this.navigability.current
		if (current && (event.key === 'Enter' || event.key === ' ') && !(event.ctrlKey || event.metaKey || event.altKey)) {
			current.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, shiftKey: event.shiftKey }))
			return true
		}
		// Claimed, so a submenu closes alone
		if (event.key === 'Escape' && this.options.expanded) {
			this.options.handleExpandedChange?.(false)
			return true
		}
		// Focus may leave for nowhere, which does not count as leaving
		if (event.key === 'Tab' && this.options.expanded) {
			this.options.handleExpandedChange?.(false)
		}
		return false
	}

	private syncItems(selection: ReadonlyArray<HTMLElement>) {
		for (const item of this.items) {
			if ('selected' in item) {
				(item as HTMLElement & { selected: unknown }).selected = selection.includes(item)
			}
		}
	}

	/** On the render root, so an item's own `change` stops before the host's listeners. */
	@eventListener({ type: 'change', target(this: MenuController) { return this.host.renderRoot } })
	protected handleChange(event: Event) {
		if (event instanceof SelectionListItemChangeEvent && event.target !== this.host) {
			const item = event.target as HTMLElement
			if (this.options.selectability && this.items.includes(item)) {
				event.stopImmediatePropagation()
				this.selectability.select(item, { selected: event.selected, preserve: true, event })
			}
		}
	}

	private readonly choices = new WeakSet<Event>()

	/** Decided as the click starts, as a re-render it causes may remove the item before it ends. */
	@eventListener({ type: 'click', options: { capture: true } })
	protected handleClickCapture(event: MouseEvent) {
		if (this.options.expanded && event.composedPath().some(target => this.items.includes(target as HTMLElement))) {
			this.choices.add(event)
		}
	}

	@eventListener('click')
	protected handleClick(event: MouseEvent & { [MenuController.preventClose]?: boolean }) {
		if (this.choices.has(event) && event[MenuController.preventClose] !== true && this.options.expanded) {
			this.options.handleExpandedChange?.(false)
		}
	}

	/** Leaving for nowhere, such as a press on the menu's padding, is not leaving. */
	@eventListener('focusout')
	protected handleFocusOut(event: FocusEvent) {
		const next = event.relatedTarget
		if (next instanceof Node && !this.contains(next)) {
			this.options.handleExpandedChange?.(false)
		}
	}

	private contains(node: Node) {
		for (let current: Node | null = node; current; current = (current as Element).assignedSlot ?? current.parentNode ?? (current as ShadowRoot).host ?? null) {
			if (current === this.host) {
				return true
			}
		}
		return false
	}
}

/** The deepest one, as `:focus-visible` never matches a shadow host. */
function activeElement() {
	let active = document.activeElement
	while (active?.shadowRoot?.activeElement) {
		active = active.shadowRoot.activeElement
	}
	return active
}
/** The property where there is one, as its attribute reflects only once the item has updated. */
function isDisabled(item: HTMLElement) {
	return 'disabled' in item ? !!item.disabled : item.hasAttribute('disabled')
}