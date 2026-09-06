import { EventListenerController, Controller, type ReactiveControllerHost, type ReactiveElement } from '@a11d/lit'
import { FocusController } from '@3mo/focus-controller'
import { NavigabilityController } from '@3mo/navigability'
import { listItem } from './extensions.js'

export interface VirtualizedListItem {
	scrollIntoView(options?: ScrollIntoViewOptions): void
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ListItem extends HTMLElement { }

export interface ListElement extends HTMLElement {
	readonly role: 'list'
	readonly items: Array<ListItem>
	readonly itemsLength?: number
	getItem?(index: number): VirtualizedListItem | ListItem | undefined
	getRenderedItemIndex?(item: ListItem): number | undefined
	/**
	 * Where the roving focus lands when the list is focused without one — the selected item, in a list
	 * that has a notion of selection. This is what scrolls a long menu to what it has selected when it
	 * opens, and what makes the first arrow key step away from there rather than from the top.
	 * `undefined` leaves the list without a focused item, as before.
	 */
	readonly defaultFocusedItemIndex?: number
}

type ListFocusHost = ReactiveControllerHost & ReactiveElement & ListElement

export class ListFocusController extends Controller {
	private static forceFocusedListsQueue = new Set<ListFocusController>()

	constructor(protected override readonly host: ListFocusHost) {
		super(host)
	}

	readonly navigability = new NavigabilityController<number, ListFocusHost>(this.host, host => ({
		get items() { return Array.from({ length: host.itemsLength ?? host.items.length }, (_, index) => index) },
		isNavigable: index => this.isFocusable(this.getItem(index)),
		getElement: index => this.getItem(index),
		keyboardTarget: null,
		focus: 'activedescendant',
		stamping: false,
		wrap: true,
		handleChange: () => this.updateFocus(),
	}))

	private get items() { return this.host.items }

	private get itemsLength() { return this.host.itemsLength ?? this.items.length }

	protected getItem(index: number) {
		return this.host.getItem?.(index) ?? this.items[index]
	}

	protected getRenderedItemIndex(item: HTMLElement) {
		const renderedItemIndex = this.host.getRenderedItemIndex?.(item)
		const index = this.items.indexOf(item)
		return renderedItemIndex ?? (index < 0 ? undefined : index)
	}

	focusItem(item: ListItem) {
		this.focusedItemIndex = this.getRenderedItemIndex(item)
	}

	get focusedItemIndex() { return this.navigability.index }
	set focusedItemIndex(value) {
		if (value === undefined || this.itemsLength === 0) {
			this.navigability.clear()
		} else {
			this.navigability.goTo(value % this.itemsLength)
		}
		this.updateFocus()
	}

	private _focused = false
	private get focused() { return this._focused }
	private set focused(value) {
		this._focused = value
		if (value && this.focusedItemIndex !== undefined) {
			this.getItem(this.focusedItemIndex)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		}
		this.updateFocus()
	}

	private updateFocus() {
		const index = this.focusedItemIndex
		for (const item of this.items) {
			item.toggleAttribute('focused',
				this.focused
				&& index !== undefined
				&& this.getRenderedItemIndex(item) === index
				&& this.isFocusable(item)
			)
		}
	}

	private isFocusable(item: ListItem | VirtualizedListItem | undefined) {
		if (!item) {
			return false
		}
		const isVirtualizedListItem = item instanceof Element === false && 'scrollIntoView' in item
		return isVirtualizedListItem || (
			item instanceof Element
			&& !item.hasAttribute('disabled')
			&& item.getAttribute('aria-hidden') !== 'true'
		)
	}

	override hostConnected() {
		this.host.tabIndex = 0
		this.items.forEach(item => item.tabIndex = -1)
	}

	override hostDisconnected() {
		this.host.tabIndex = -1
	}

	focusIn() {
		this.focusController.focusIn()
		this.handleFocusIn()
	}

	focusOut() {
		this.focusController.focusOut()
		this.handleFocusOut()
	}

	protected handleFocusIn() {
		// Seeded before `focused`, so the very first `updateFocus` already has an item to scroll to.
		// Only when there is none yet: a pointer-down on an item sets it before focus arrives, and
		// that gesture must not be overruled by the selection.
		if (this.focusedItemIndex === undefined) {
			const defaultFocusedItemIndex = this.host.defaultFocusedItemIndex
			if (defaultFocusedItemIndex !== undefined) {
				this.focusedItemIndex = defaultFocusedItemIndex
			}
		}
		this.focused = true
		ListFocusController.forceFocusedListsQueue.add(this)
	}

	protected handleFocusOut() {
		this.focused = false
		ListFocusController.forceFocusedListsQueue.delete(this)
	}

	private _keyboardFocus = false
	get keyboardFocus() { return this._keyboardFocus }
	set keyboardFocus(value) {
		this._keyboardFocus = value
		for (const item of this.items) {
			item.toggleAttribute('data-keyboard-focus', this.hasFocus && value)
		}
	}

	protected readonly focusController = new FocusController(this.host, {
		handleChange: (focused, bubbled, method) => {
			this.keyboardFocus = method === 'keyboard'
			if (!bubbled) {
				if (focused) {
					this.handleFocusIn()
					if (this.keyboardFocus && this.focusedItemIndex === undefined) {
						this.navigability.goFirst({ method: 'keyboard' })
					}
				} else {
					this.handleFocusOut()
				}
			}
		},
	})

	get hasFocus() {
		return this.focusController.focused
			&& (!ListFocusController.forceFocusedListsQueue.size || [...ListFocusController.forceFocusedListsQueue].pop() === this)
	}

	protected readonly itemsPointerDownEventListener = new EventListenerController(this.host, {
		target: () => this.host,
		type: 'pointerdown',
		listener: (event: PointerEvent) => {
			const item = event.composedPath().find(item => !!(item as Element)[listItem])
			this.focusedItemIndex = item ? this.getRenderedItemIndex(item as HTMLElement) : undefined
		}
	})

	protected readonly keyDownEventListener = new EventListenerController(this.host, {
		type: 'keydown',
		target: document,
		listener: (event: KeyboardEvent) => {
			if (this.hasFocus === false || event.ctrlKey || event.shiftKey) {
				return
			}

			if (this.navigability.handleKeyDown(event)) {
				this.keyboardFocus = true
				event.stopPropagation()
			}

			this.host.items.forEach(item => item.dispatchEvent(new CustomEvent('listKeyDown', {
				detail: event,
				bubbles: true,
				composed: true,
			})))
		}
	})
}