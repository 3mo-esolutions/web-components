import { Controller, eventListener, type ReactiveElement } from '@a11d/lit'
import { NavigabilityController, type NavigabilityGoOptions } from '@3mo/navigability'
import { OverflowController } from '@3mo/overflow-controller'

/**
 * The menu an item opens, such as `mo-menu`: it opens on `open`, reports through `openChange` and sets
 * `aria-haspopup` and `aria-expanded` on its `anchor`.
 */
export interface MenuBarMenuElement extends EventTarget {
	open: boolean
	anchor?: HTMLElement
}

/** What the bar needs of an item, such as `mo-menu-bar-item`. */
export interface MenuBarItemElement extends HTMLElement {
	/** The `menuitem`, which the menu is anchored to. */
	readonly trigger?: HTMLElement
	readonly menu?: MenuBarMenuElement
	readonly disabled?: boolean
	/** Matched by typeahead. */
	readonly label?: string
}

export interface MenuBarControllerOptions<T extends MenuBarItemElement> {
	/** The items in order, read on every access. */
	readonly items: ReadonlyArray<T>
}

/**
 * The `menubar` pattern: one tab stop, arrows across the items, and menus which follow the cursor once
 * one of them is open.
 *
 * ```ts
 * readonly menuBarController = new MenuBarController(this, host => ({
 *   get items() { return host.items },
 * }))
 * ```
 *
 * @ssr false
 */
export class MenuBarController<T extends MenuBarItemElement = MenuBarItemElement, THost extends ReactiveElement = ReactiveElement> extends Controller {
	private readonly navigability: NavigabilityController<T>
	private readonly overflow: OverflowController<T>

	protected readonly options: MenuBarControllerOptions<T>

	constructor(
		protected override readonly host: THost,
		options: MenuBarControllerOptions<T> | ((host: THost) => MenuBarControllerOptions<T>)
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this
		this.navigability = new NavigabilityController<T>(host, {
			get items() { return controller.items },
			isNavigable: item => !item.disabled && !controller.overflow.overflows(item),
			orientation: 'horizontal',
			wrap: true,
			typeahead: item => item.label ?? '',
			keyboardTarget: null,
		})
		this.overflow = new OverflowController<T>(host, {
			get container() { return host },
			get items() { return controller.items },
			handleChange: (item, overflows) => item.toggleAttribute('data-overflowed', overflows),
		})
	}

	get items() { return this.options.items }

	/** The item whose menu is open. */
	get openItem(): T | undefined { return this.items.find(item => item.menu?.open) }

	/** Whether some items do not fit. Those carry `data-overflowed`. */
	get hasOverflow() { return this.overflow.hasOverflow }

	/** Opens an item's menu and closes whichever was open. */
	open(item?: T, options?: NavigabilityGoOptions) {
		const previous = this.openItem
		if (item?.disabled || previous === item) {
			return
		}
		if (item) {
			this.navigability.goTo(item, options)
			if (item.trigger && this.hasFocusWithin) {
				item.trigger.focus()
			}
			if (item.menu) {
				item.menu.open = true
			}
		}
		if (previous?.menu) {
			previous.menu.open = false
		}
		this.observeSwitching(!!item?.menu)
		this.host.requestUpdate()
	}

	/** Closes whatever is open. */
	close() {
		this.open(undefined)
	}

	/** Called by the host when its items change. */
	handleItemsChange() {
		this.sync()
		this.host.requestUpdate()
	}

	override hostUpdated() {
		this.sync()
	}

	override hostDisconnected() {
		this.observeSwitching(false)
		for (const menu of this.subscriptions) {
			menu.removeEventListener('openChange', this.handleMenuOpenChange)
		}
		this.subscriptions.clear()
	}

	private registered = new Array<T>()

	private sync() {
		const items = this.items
		for (const previous of this.registered) {
			if (!items.includes(previous)) {
				this.unsubscribe(previous)
			}
		}
		this.host.setAttribute('role', 'menubar')
		items.forEach((item, index) => {
			item.setAttribute('role', 'none')
			const trigger = item.trigger
			if (trigger) {
				trigger.setAttribute('role', 'menuitem')
				this.navigability.indexability.register(trigger, { index, data: item, disabled: !!item.disabled })
			}
			this.subscribe(item)
		})
		this.registered = [...items]
		// Items render their triggers after the bar's first update
		if (!this.awaitingTriggers && items.some(item => !item.trigger)) {
			this.awaitingTriggers = true
			queueMicrotask(() => {
				this.awaitingTriggers = false
				this.host.requestUpdate()
			})
		}
	}

	private awaitingTriggers = false

	private readonly subscriptions = new Set<MenuBarMenuElement>()

	private subscribe(item: T) {
		const menu = item.menu
		if (menu && !this.subscriptions.has(menu)) {
			this.subscriptions.add(menu)
			menu.addEventListener('openChange', this.handleMenuOpenChange)
		}
	}

	private unsubscribe(item: T) {
		const trigger = item.trigger
		if (trigger) {
			this.navigability.indexability.unregister(trigger)
		}
		const menu = item.menu
		if (menu) {
			this.subscriptions.delete(menu)
			menu.removeEventListener('openChange', this.handleMenuOpenChange)
		}
	}

	private readonly handleMenuOpenChange = () => {
		this.observeSwitching(!!this.openItem)
		this.host.requestUpdate()
	}

	/** Captured, so that Home and End move the cursor before the menu opens on them. */
	@eventListener({ type: 'keydown', options: { capture: true } })
	protected handleKeyDown(event: KeyboardEvent) {
		if (!this.openItem) {
			this.navigability.handleKeyDown(event)
		}
	}

	private switching = false

	private observeSwitching(active: boolean) {
		if (active !== this.switching) {
			this.switching = active
			const method = active ? 'addEventListener' : 'removeEventListener'
			this.host.ownerDocument[method]('keydown', this.handleSwitchingKeyDown as EventListener)
		}
	}

	/** Read on the document, after the open menu has claimed the arrows it uses for its submenus. */
	private readonly handleSwitchingKeyDown = (event: KeyboardEvent) => {
		if (event.defaultPrevented || !this.openItem) {
			return
		}
		const rtl = getComputedStyle(this.host).direction === 'rtl'
		const forward = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')
		const backward = event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')
		if (!forward && !backward) {
			return
		}
		event.preventDefault()
		const options = { method: 'keyboard', event } as const
		if (forward ? this.navigability.goNext(options) : this.navigability.goPrevious(options)) {
			this.open(this.navigability.current, options)
		}
	}

	/**
	 * Hovering switches menus only once one is open. Listened to on the render root, as a `pointerover`
	 * between items rendered in the host's own shadow root never reaches the host.
	 */
	@eventListener({ type: 'pointerover', target(this: MenuBarController) { return this.host.renderRoot } })
	protected handlePointerOver(event: PointerEvent) {
		const item = this.navigability.indexability.itemAt(event.composedPath())?.options.data
		if (event.pointerType === 'mouse' && this.openItem && item) {
			this.open(item, { method: 'pointer', event })
		}
	}

	@eventListener('focusout')
	protected handleFocusOut(event: FocusEvent) {
		if (!this.host.contains(event.relatedTarget as Node | null)) {
			this.close()
		}
	}

	private get hasFocusWithin() {
		return this.host.contains(this.host.ownerDocument.activeElement)
	}
}