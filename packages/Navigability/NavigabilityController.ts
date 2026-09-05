import { Controller, type ReactiveControllerHost, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController, type IndexabilityItem } from '@3mo/indexability'

export type NavigabilityMethod = 'keyboard' | 'pointer' | 'programmatic'

export type NavigabilityOrientation = 'vertical' | 'horizontal' | 'both'

/** `roving` moves DOM focus onto the current item; `activedescendant` keeps it on the keyboard target and announces the current item through `aria-activedescendant`. */
export type NavigabilityFocus = 'roving' | 'activedescendant'

/** An item's element, or the shim a virtualizer hands out for one it has not rendered. */
export interface NavigabilityElement {
	scrollIntoView(options?: ScrollIntoViewOptions): void
}

export type NavigabilityChange<T> = {
	readonly item: T | undefined
	readonly index: number | undefined
	readonly method: NavigabilityMethod
	/** The input that moved the cursor, where there was one. */
	readonly event?: Event
}

export type NavigabilityGoOptions = {
	readonly method?: NavigabilityMethod
	readonly event?: Event
}

export interface NavigabilityControllerOptions<T> {
	/** The owner's full ordered universe, rendered or not. */
	readonly items: ReadonlyArray<T>
	/** Identity. Defaults to the item itself. */
	readonly key?: (item: T) => unknown
	/** An item that is not navigable stays in the order but is stepped over. Defaults to the registry's `disabled` flag. */
	readonly isNavigable?: (item: T) => boolean
	readonly disabled?: boolean
	/** Defaults to `roving`. */
	readonly focus?: NavigabilityFocus
	/** Defaults to `vertical`. */
	readonly orientation?: NavigabilityOrientation
	/** Whether the ends connect. Defaults to `false`. */
	readonly wrap?: boolean
	/** Typing moves the cursor to the next item whose text starts with what was typed. `true` reads the element's text, a function reads the item. Defaults to `false`. */
	readonly typeahead?: boolean | ((item: T) => string)
	/** Writes `data-navigability` and the tab order or `aria-activedescendant` the focus strategy calls for. Off, for a host that reflects the cursor itself. Defaults to `true`. */
	readonly stamping?: boolean
	/** The element of an item the registry has not seen: a virtualized host answers with its scroller's shim. */
	readonly getElement?: (index: number) => NavigabilityElement | undefined
	/** Where keys arrive and, in the `activedescendant` strategy, where the current item is announced. Defaults to the host; `null` leaves the keys to the owner, which calls {@link NavigabilityController.handleKeyDown} itself. */
	readonly keyboardTarget?: EventTarget | null
	/** Called only when the cursor actually moved. */
	readonly handleChange?: (change: NavigabilityChange<T>) => void
	/** First look at every keydown. Return `true` to claim the key. */
	readonly handleKeyDown?: (event: KeyboardEvent, item: T | undefined) => boolean | void
	/** A shared registry to adopt. Absent, the controller creates its own. */
	readonly indexability?: IndexabilityController<T>
}

type NavigabilityHost = ReactiveControllerHost & EventTarget

/**
 * The current item of a composite widget, kept apart from selection and from focus:
 *
 * ```ts
 * readonly navigability = new NavigabilityController<Person>(this, host => ({
 *   get items() { return host.visiblePeople },
 *   isNavigable: person => !person.disabled,
 *   typeahead: true,
 * }))
 * ```
 *
 * The cursor is kept on three levels: the desired index (the intent, sticky while the items change under
 * it), the index (the desired one clamped and snapped to the nearest navigable item) and the item (found
 * again by key when the items are replaced). Arrows, Home and End, PageUp and PageDown and typeahead move
 * it. A change carries its event, so a controller composing selection extends a range on Shift+Arrow.
 */
export class NavigabilityController<T, THost extends NavigabilityHost = NavigabilityHost> extends Controller implements EventListenerObject {
	static readonly typeaheadTimeout = 1000

	private static idCounter = 0

	readonly indexability: IndexabilityController<T>

	protected readonly options: NavigabilityControllerOptions<T>

	constructor(protected override readonly host: THost, options: NavigabilityControllerOptions<T> | ((host: THost) => NavigabilityControllerOptions<T>)) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		this.indexability = this.options.indexability ?? new IndexabilityController<T>(host as unknown as ReactiveElement)
		this.indexability.observe({
			handleItemUpdated: item => this.register(item),
			handleItemRemoved: element => this.unregister(element),
		})
		// `super()` already called `hostConnected` for a connected host, before the options existed.
		if ((host as Partial<Node>).isConnected) {
			this.hostConnected()
		}
	}

	private listening = false

	private desiredIndex = -1
	private _index = -1
	private _item: T | undefined
	private currentKey: unknown
	private lastPointerDown = 0
	private method: NavigabilityMethod = 'programmatic'
	private typed = ''
	private typedTimeout?: ReturnType<typeof setTimeout>
	private itemsSnapshot?: ReadonlyArray<T>
	private readonly registered = new Map<number, IndexabilityItem<T>>()
	private readonly indices = new WeakMap<HTMLElement, number>()

	/** Registers an item: `<li ${controller.item({ index, data })}>`. See {@link IndexabilityController.item}. */
	get item() { return this.indexability.item }

	/** The current item's position in the items, or `undefined` while there is none. */
	get index(): number | undefined { return this._index < 0 ? undefined : this._index }
	get current(): T | undefined { return this._item }

	private get items() { return this.options.items }
	private get key() { return this.options.key ?? ((item: T) => item) }
	private get orientation() { return this.options.orientation ?? 'vertical' }
	private get focusStrategy() { return this.options.focus ?? 'roving' }
	private get stamping() { return this.options.stamping ?? true }
	private get keyboardTarget() { return this.options.keyboardTarget === undefined ? this.host : this.options.keyboardTarget }

	override hostConnected() {
		if (!this.options || this.listening) {
			return
		}
		this.listening = true
		this.host.addEventListener('pointerdown', this)
		this.host.addEventListener('focusin', this)
		this.keyboardTarget?.addEventListener('keydown', this)
	}

	override hostDisconnected() {
		this.listening = false
		this.host.removeEventListener('pointerdown', this)
		this.host.removeEventListener('focusin', this)
		this.keyboardTarget?.removeEventListener('keydown', this)
	}

	override hostUpdated() {
		this.reconcile()
		this.stamp()
	}

	handleEvent(event: Event) {
		switch (event.type) {
			case 'pointerdown':
				this.lastPointerDown = performance.now()
				this.handlePointerDown(event as PointerEvent)
				break
			case 'focusin':
				this.handleFocusIn(event as FocusEvent)
				break
			case 'keydown':
				this.handleKeyDown(event as KeyboardEvent)
				break
		}
	}

	goTo(target: number | T | undefined, options?: NavigabilityGoOptions) {
		const index = target === undefined ? -1
			: typeof target === 'number' ? target
				: this.items.findIndex(item => this.key(item) === this.key(target))
		if (index === -1 && target !== undefined) {
			return false
		}
		const resolved = index < 0 ? -1 : this.closestNavigable(Math.max(0, Math.min(this.items.length - 1, index)), 1, false)
		this.desiredIndex = resolved
		return this.commit(resolved, options?.method ?? 'programmatic', options?.event)
	}

	goNext(options?: NavigabilityGoOptions) {
		return this.move(this._index < 0 ? 0 : this._index + 1, 1, options)
	}

	goPrevious(options?: NavigabilityGoOptions) {
		return this.move(this._index < 0 ? this.items.length - 1 : this._index - 1, -1, options)
	}

	goFirst(options?: NavigabilityGoOptions) {
		return this.move(0, 1, { ...options, wrap: false })
	}

	goLast(options?: NavigabilityGoOptions) {
		return this.move(this.items.length - 1, -1, { ...options, wrap: false })
	}

	clear() {
		this.desiredIndex = -1
		this.currentKey = undefined
		this.commit(-1, 'programmatic')
	}

	/** Returns `true` when the key was the cursor's, in which case its default was prevented. */
	handleKeyDown(event: KeyboardEvent): boolean {
		if (this.options.disabled || event.defaultPrevented) {
			return false
		}
		if (this.options.handleKeyDown?.(event, this._item)) {
			event.preventDefault()
			return true
		}
		if (event.ctrlKey || event.metaKey || event.altKey) {
			return false
		}
		const options: NavigabilityGoOptions = { method: 'keyboard', event }
		const vertical = this.orientation !== 'horizontal'
		const horizontal = this.orientation !== 'vertical'
		const rtl = this.host instanceof Element && getComputedStyle(this.host).direction === 'rtl'
		let handled = false

		switch (event.key) {
			case 'ArrowDown':
				if (vertical) {
					this.goNext(options)
					handled = true
				}
				break
			case 'ArrowUp':
				if (vertical) {
					this.goPrevious(options)
					handled = true
				}
				break
			case 'ArrowRight':
				if (horizontal) {
					rtl ? this.goPrevious(options) : this.goNext(options)
					handled = true
				}
				break
			case 'ArrowLeft':
				if (horizontal) {
					rtl ? this.goNext(options) : this.goPrevious(options)
					handled = true
				}
				break
			case 'Home':
				this.goFirst(options)
				handled = true
				break
			case 'End':
				this.goLast(options)
				handled = true
				break
			case 'PageDown':
				this.page(true, options)
				handled = true
				break
			case 'PageUp':
				this.page(false, options)
				handled = true
				break
			case 'Backspace':
				if (this.options.typeahead && this.typed) {
					this.typed = this.typed.slice(0, -1)
					handled = this.type(options)
				}
				break
			case 'Escape':
				this.resetTypeahead()
				break
			default:
				if (this.options.typeahead && event.key.length === 1 && (this.typed || event.key !== ' ')) {
					this.typed += event.key
					handled = this.type(options)
				}
				break
		}

		if (handled) {
			event.preventDefault()
		}
		return handled
	}

	/**
	 * Puts the cursor as close to where it was meant to be as the items allow: the same item by key where
	 * it still exists, otherwise the desired index clamped and snapped to the nearest navigable item,
	 * forward first and then backward.
	 */
	private reconcile() {
		const items = this.items
		const count = items.length
		let desired = this.desiredIndex

		if (items !== this.itemsSnapshot && this.currentKey !== undefined) {
			const stillThere = this._index >= 0 && this._index < count && this.key(items[this._index]!) === this.currentKey
			if (!stillThere) {
				const found = items.findIndex(item => this.key(item) === this.currentKey)
				if (found !== -1) {
					desired = found
				}
			}
		}
		this.itemsSnapshot = items

		let index = -1
		if (desired >= 0 && count > 0) {
			const clamped = Math.max(0, Math.min(count - 1, desired))
			index = this.closestNavigable(clamped, 1, false)
			if (index === -1) {
				index = this.closestNavigable(clamped - 1, -1, false)
			}
		}

		this.desiredIndex = desired < 0 ? -1 : desired
		this.commit(index, 'programmatic')
	}

	private type(options: NavigabilityGoOptions) {
		clearTimeout(this.typedTimeout)
		this.typedTimeout = setTimeout(() => this.typed = '', NavigabilityController.typeaheadTimeout)
		this.goToText(this.typed, options)
		return true
	}

	private resetTypeahead() {
		clearTimeout(this.typedTimeout)
		this.typed = ''
	}

	/** A single character repeated cycles through the items starting with it, unless something starts with the whole run. */
	private goToText(prefix: string, options: NavigabilityGoOptions) {
		const search = prefix.toLowerCase()
		if (!search) {
			return false
		}
		const items = this.items
		const count = items.length
		const single = [...search].every(character => character === search[0])
		const matches = (start: number, text: string) => {
			for (let offset = 0; offset < count; offset++) {
				const index = (start + offset) % count
				if (this.isNavigable(index) && this.textOf(index).toLowerCase().startsWith(text)) {
					return index
				}
			}
			return -1
		}
		const start = this._index < 0 ? 0 : search.length > 1 && !single ? this._index : this._index + 1
		let index = matches(start, search)
		if (index === -1 && single) {
			index = matches(this._index + 1, search[0]!)
		}
		if (index === -1) {
			return false
		}
		this.desiredIndex = index
		return this.commit(index, options.method ?? 'keyboard', options.event)
	}

	private handlePointerDown(event: PointerEvent) {
		if (this.options.disabled) {
			return
		}
		const index = this.indexability.itemAt(event.composedPath())?.options.index
		if (index !== undefined && this.isNavigable(index)) {
			this.desiredIndex = index
			this.commit(index, 'pointer', event)
		}
	}

	private handleFocusIn(event: FocusEvent) {
		if (this.options.disabled || this.focusStrategy !== 'roving') {
			return
		}
		const index = this.indexability.itemAt(event.composedPath())?.options.index
		if (index !== undefined && index !== this._index && this.isNavigable(index)) {
			const target = event.composedPath()[0]
			const method: NavigabilityMethod = performance.now() - this.lastPointerDown < 500 ? 'pointer'
				: target instanceof Element && target.matches(':focus-visible') ? 'keyboard' : 'programmatic'
			this.desiredIndex = index
			this.commit(index, method, event)
		}
	}

	private register(item: IndexabilityItem<T>) {
		const previous = this.indices.get(item.element)
		if (previous !== undefined && previous !== item.options.index && this.registered.get(previous)?.element === item.element) {
			this.registered.delete(previous)
		}
		this.registered.set(item.options.index, item)
		this.indices.set(item.element, item.options.index)
		this.stampItem(item)
	}

	private unregister(element: HTMLElement) {
		const index = this.indices.get(element)
		if (index !== undefined && this.registered.get(index)?.element === element) {
			this.registered.delete(index)
		}
		this.indices.delete(element)
	}

	private isNavigable(index: number) {
		const item = this.items[index]
		if (item === undefined) {
			return false
		}
		return this.options.isNavigable ? this.options.isNavigable(item) : !this.registered.get(index)?.options.disabled
	}

	private elementOf(index: number): NavigabilityElement | undefined {
		return this.registered.get(index)?.element ?? this.options.getElement?.(index)
	}

	private textOf(index: number) {
		const { typeahead } = this.options
		if (typeof typeahead === 'function') {
			return typeahead(this.items[index]!)
		}
		const element = this.elementOf(index)
		return element instanceof Element
			? element.getAttribute('aria-label') || element.getAttribute('alt') || (element as HTMLElement).innerText || element.textContent || ''
			: String(this.items[index])
	}

	private move(start: number, direction: 1 | -1, options?: NavigabilityGoOptions & { wrap?: boolean }) {
		const index = this.closestNavigable(start, direction, options?.wrap ?? this.options.wrap ?? false)
		if (index === -1) {
			return false
		}
		this.desiredIndex = index
		return this.commit(index, options?.method ?? 'programmatic', options?.event)
	}

	private closestNavigable(start: number, direction: 1 | -1, wrap: boolean) {
		const count = this.items.length
		if (count === 0) {
			return -1
		}
		if (wrap) {
			let index = ((start % count) + count) % count
			for (let step = 0; step < count; step++) {
				if (this.isNavigable(index)) {
					return index
				}
				index = (((index + direction) % count) + count) % count
			}
			return -1
		}
		for (let index = start; index >= 0 && index < count; index += direction) {
			if (this.isNavigable(index)) {
				return index
			}
		}
		return -1
	}

	/** To the item at the scroller's edge first, then a page beyond it. */
	private page(downward: boolean, options: NavigabilityGoOptions) {
		const count = this.items.length
		if (count === 0) {
			return false
		}
		const current = this._index < 0 ? undefined : this.elementOf(this._index)
		const scroller = current instanceof Element ? this.scrollerOf(current) : undefined
		if (!scroller) {
			return downward ? this.goLast(options) : this.goFirst(options)
		}

		const scrollerRect = scroller.getBoundingClientRect()
		const atEdge = this.indexAtY(downward ? scrollerRect.bottom : scrollerRect.top, downward)

		let index: number | null
		if (atEdge !== null && atEdge === this._index) {
			const rect = (current as Element).getBoundingClientRect()
			index = this.indexAtY(downward ? rect.bottom + scroller.clientHeight : rect.top - scroller.clientHeight, downward)
		} else {
			index = atEdge
		}

		if (index === null) {
			index = this.closestNavigable(downward ? count - 1 : 0, downward ? -1 : 1, false)
		}
		if (index === -1 || index === this._index) {
			return false
		}
		this.desiredIndex = index
		return this.commit(index, options.method ?? 'keyboard', options.event)
	}

	/** The navigable item whose content box spans the y coordinate, or `null` when none is rendered there. */
	private indexAtY(y: number, downward: boolean): number | null {
		const count = this.items.length
		for (let step = 0; step < count; step++) {
			const index = downward ? step : count - 1 - step
			if (!this.isNavigable(index)) {
				continue
			}
			const element = this.elementOf(index)
			if (!(element instanceof Element)) {
				continue
			}
			const rect = element.getBoundingClientRect()
			if (rect.top <= y && y <= rect.bottom) {
				const style = getComputedStyle(element)
				const contentTop = rect.top + (parseFloat(style.paddingTop) || 0)
				const contentBottom = rect.bottom - (parseFloat(style.paddingBottom) || 0)
				if ((downward && contentTop <= y) || (!downward && contentBottom >= y)) {
					return index
				}
				const previous = downward ? index - 1 : index + 1
				return previous >= 0 && previous < count ? previous : index
			}
		}
		return null
	}

	private scrollerOf(element: Element): Element | undefined {
		for (let current: Element | null = element; current; current = current.parentElement ?? (current.getRootNode() as ShadowRoot).host ?? null) {
			const { overflowY } = getComputedStyle(current)
			if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
				return current
			}
			if ((current as EventTarget) === this.host) {
				break
			}
		}
		return this.host instanceof Element ? this.host : undefined
	}

	private commit(index: number, method: NavigabilityMethod, event?: Event) {
		const item = index < 0 ? undefined : this.items[index]
		const previousItem = this._item
		const changed = index !== this._index
			|| (item !== undefined && previousItem !== undefined && this.key(item) !== this.key(previousItem))
			|| (item === undefined) !== (previousItem === undefined)
		if (!changed) {
			return false
		}
		this._index = index
		this._item = item
		this.currentKey = item === undefined ? undefined : this.key(item)
		this.method = method
		this.stamp()
		this.follow(method)
		this.options.handleChange?.({ item, index: this.index, method, event })
		this.host.requestUpdate()
		return true
	}

	private follow(method: NavigabilityMethod) {
		const element = this._index < 0 ? undefined : this.elementOf(this._index)
		if (!element) {
			return
		}
		if (this.focusStrategy === 'roving' && method !== 'pointer' && element instanceof HTMLElement && this.hasFocusWithin && element !== this.activeElement) {
			element.focus({ preventScroll: true })
		}
		element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
	}

	private get activeElement() {
		let element = document.activeElement
		while (element?.shadowRoot?.activeElement) {
			element = element.shadowRoot.activeElement
		}
		return element
	}

	private get hasFocusWithin() {
		if (!(this.host instanceof Node)) {
			return false
		}
		for (let node: Node | null = this.activeElement; node; node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)) {
			if (node === this.host) {
				return true
			}
		}
		return false
	}

	private stamp() {
		if (!this.stamping) {
			return
		}
		const firstNavigable = this._index === -1 ? this.closestNavigable(0, 1, false) : -1
		for (const item of this.registered.values()) {
			this.stampItem(item, firstNavigable)
		}
		if (this.focusStrategy === 'activedescendant') {
			const target = this.keyboardTarget instanceof HTMLElement ? this.keyboardTarget : this.host instanceof HTMLElement ? this.host : undefined
			const element = this.registered.get(this._index)?.element
			if (target && element) {
				element.id ||= `navigability-${++NavigabilityController.idCounter}`
				target.setAttribute('aria-activedescendant', element.id)
			} else {
				target?.removeAttribute('aria-activedescendant')
			}
		}
	}

	private stampItem({ element, options }: IndexabilityItem<T>, firstNavigable = this._index === -1 ? this.closestNavigable(0, 1, false) : -1) {
		if (!this.stamping) {
			return
		}
		const isCurrent = options.index === this._index
		if (isCurrent) {
			element.dataset.navigability = 'current'
			element.dataset.navigabilityMethod = this.method
		} else {
			delete element.dataset.navigability
			delete element.dataset.navigabilityMethod
		}
		if (this.focusStrategy === 'roving') {
			element.tabIndex = isCurrent || options.index === firstNavigable ? 0 : -1
		} else {
			element.removeAttribute('tabindex')
		}
	}
}