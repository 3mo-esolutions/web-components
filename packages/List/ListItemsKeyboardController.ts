import { EventListenerController, Controller, ReactiveControllerHost, ReactiveElement } from '@a11d/lit'
import { FocusController } from '@3mo/focus-controller'
import { isListItem } from './List.js'

export interface VirtualizedListItem {
	scrollIntoView(options?: ScrollIntoViewOptions): void
}

interface ListItem extends HTMLElement { }

export interface ListElement extends HTMLElement {
	readonly role: 'list'
	readonly items: Array<ListItem>
	readonly itemsLength?: number
	getItem?(index: number): VirtualizedListItem | ListItem | undefined
	getRenderedItemIndex?(item: ListItem): number | undefined
}

export class ListItemsKeyboardController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost & ReactiveElement & ListElement) {
		super(host)
	}

	private get items() { return this.host.items }

	private get itemsLength() { return this.host.itemsLength ?? this.items.length }

	protected getItem(index: number) {
		return this.host.getItem?.(index) ?? this.items[index]
	}

	protected getRenderedItemIndex(item: HTMLElement) {
		return this.host.getRenderedItemIndex?.(item) ?? this.items.indexOf(item)
	}

	private _focusedItemIndex?: number
	get focusedItemIndex() { return this._focusedItemIndex }
	set focusedItemIndex(value) {
		if (value !== undefined) {
			if (value < 0) {
				value = this.itemsLength + value
			}

			if (value >= this.itemsLength) {
				value = value - this.itemsLength
			}
		}

		this._focusedItemIndex = value

		if (value !== undefined) {
			const item = this.getItem(value)
			item?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		}

		for (const item of this.items) {
			if (value !== undefined && this.getRenderedItemIndex(item) === value) {
				item.setAttribute('focused', '')
			} else {
				item.removeAttribute('focused')
			}
		}
	}

	override hostConnected() {
		this.host.tabIndex = 0
		this.items.forEach(item => item.tabIndex = -1)
	}

	override hostDisconnected() {
		this.host.tabIndex = -1
	}

	focusFirstItem() {
		this.focusedItemIndex = 0
	}

	focusLastItem() {
		this.focusedItemIndex = this.itemsLength - 1
	}

	focusNextItem() {
		this.focusedItemIndex = (this.focusedItemIndex ?? -1) + 1
	}

	focusPreviousItem() {
		this.focusedItemIndex = (this.focusedItemIndex ?? 0) - 1
	}

	unfocus() {
		this.focusedItemIndex = undefined
	}

	forceFocused = false

	protected readonly focusController = new FocusController(this.host, {
		handleChange: (focused, bubbled) => {
			if (!bubbled) {
				if (focused) {
					this.focusedItemIndex ??= 0
				} else {
					this.focusedItemIndex = undefined
				}
			}
		},
	})

	get hasFocus() { return this.focusController.focused || this.forceFocused }

	protected readonly itemsPointerDownEventListener = new EventListenerController(this.host, {
		target: () => this.host,
		type: 'pointerdown',
		listener: (event: PointerEvent) => {
			const listItem = event.composedPath().find(item => isListItem(item as HTMLElement))
			this.focusedItemIndex = this.getRenderedItemIndex(listItem as ListItem)
		}
	})

	protected readonly keyDownEventListener = new EventListenerController(this.host, {
		type: 'keydown',
		target: document,
		listener: (event: KeyboardEvent) => {
			if (this.hasFocus === false) {
				return
			}

			if (event.ctrlKey || event.shiftKey) {
				return
			}

			let prevent = false

			switch (event.key) {
				case 'Down':
				case 'ArrowDown':
					this.focusNextItem()
					prevent = true
					break
				case 'Up':
				case 'ArrowUp':
					this.focusPreviousItem()
					prevent = true
					break
				case 'Home':
				case 'PageUp':
					this.focusFirstItem()
					prevent = true
					break
				case 'End':
				case 'PageDown':
					this.focusLastItem()
					prevent = true
					break
				default:
					break
			}

			if (prevent) {
				event.stopPropagation()
				event.preventDefault()
			}
		}
	})
}