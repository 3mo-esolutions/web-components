import { EventListenerController, Controller, type ReactiveControllerHost, type ReactiveElement } from '@a11d/lit'
import { FocusController } from '@3mo/focus-controller'
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
}

export class ListFocusController extends Controller {
	private static forceFocusedListsQueue = new Set<ListFocusController>()

	constructor(protected override readonly host: ReactiveControllerHost & ReactiveElement & ListElement) {
		super(host)
	}

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

	private _focusedItemIndex?: number
	get focusedItemIndex() { return this._focusedItemIndex }
	set focusedItemIndex(value) {
		if (value !== undefined) {
			value %= this.itemsLength
		}

		this._focusedItemIndex = value
		this.updateFocus()
	}

	private _focused = false
	private get focused() { return this._focused }
	private set focused(value) {
		this._focused = value
		this.updateFocus()
	}

	private updateFocus() {
		if (this.focused && this.focusedItemIndex !== undefined) {
			const item = this.getItem(this.focusedItemIndex)
			item?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		}

		for (const item of this.items) {
			item.toggleAttribute('focused',
				this.focused
				&& this.focusedItemIndex !== undefined
				&& this.getRenderedItemIndex(item) === this.focusedItemIndex
				&& this.isFocusable(item)
			)
		}
	}

	private isFocusable(item: ListItem | VirtualizedListItem) {
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
		this.focused = true
		ListFocusController.forceFocusedListsQueue.add(this)
	}

	protected handleFocusOut() {
		this.focused = false
		ListFocusController.forceFocusedListsQueue.delete(this)
	}

	private focusFirstItem() {
		this.focusTraversal(0, 'forward')
	}

	private focusLastItem() {
		this.focusTraversal(this.itemsLength - 1, 'backward')
	}

	private focusNextItem() {
		this.focusTraversal((this.focusedItemIndex ?? -1) + 1, 'forward')
	}

	private focusPreviousItem() {
		this.focusTraversal((this.focusedItemIndex ?? 0) - 1, 'backward')
	}

	private focusTraversal(index: number, direction: 'forward' | 'backward') {
		let breakSafe = 0
		while (true) {
			if (breakSafe >= this.itemsLength) {
				break
			}
			index %= this.itemsLength

			const item = this.getItem(index)
			if (item && this.isFocusable(item)) {
				this.focusedItemIndex = index
				break
			}
			index = direction === 'forward' ? index + 1 : index - 1
			index = index < 0 ? this.itemsLength - 1 : index
			breakSafe++
		}
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
						this.focusFirstItem()
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
			this.focusedItemIndex = this.getRenderedItemIndex(item as ListItem)
		}
	})

	protected readonly keyDownEventListener = new EventListenerController(this.host, {
		type: 'keydown',
		target: document,
		listener: (event: KeyboardEvent) => {
			if (this.hasFocus === false || event.ctrlKey || event.shiftKey) {
				return
			}

			let prevent = false

			switch (event.key) {
				case 'Down':
				case 'ArrowDown':
					this.keyboardFocus = true
					this.focusNextItem()
					prevent = true
					break
				case 'Up':
				case 'ArrowUp':
					this.keyboardFocus = true
					this.focusPreviousItem()
					prevent = true
					break
				case 'Home':
				case 'PageUp':
					this.keyboardFocus = true
					this.focusFirstItem()
					prevent = true
					break
				case 'End':
				case 'PageDown':
					this.keyboardFocus = true
					this.focusLastItem()
					prevent = true
					break
				default:
					break
			}

			if (prevent) {
				event.preventDefault()
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