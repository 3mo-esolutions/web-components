import { EventListenerController, Controller, ReactiveControllerHost, ReactiveElement } from '@a11d/lit'
import { isList, isListItem } from './List.js'

interface VirtualizedListItem {
	scrollIntoView(options?: ScrollIntoViewOptions): void
}

interface ListItem extends HTMLElement { }

interface ElementWithItems extends HTMLElement {
	readonly items: Array<ListItem>
	readonly itemsLength?: number
	getItem?(index: number): VirtualizedListItem | ListItem | undefined
	getRenderedItemIndex?(item: ListItem): number | undefined
}

export class ListItemsKeyboardController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost & ReactiveElement & ElementWithItems) {
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
	protected get focusedItemIndex() { return this._focusedItemIndex }
	protected set focusedItemIndex(value) {
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

	protected focusFirstItem() {
		this.focusedItemIndex = 0
	}

	protected focusLastItem() {
		this.focusedItemIndex = this.itemsLength - 1
	}

	protected focusNextItem() {
		this.focusedItemIndex = (this.focusedItemIndex ?? -1) + 1
	}

	protected focusPreviousItem() {
		this.focusedItemIndex = (this.focusedItemIndex ?? 0) - 1
	}

	protected readonly focusEventListener = new EventListenerController(this.host, 'focus', () => this.focusedItemIndex ??= 0)

	protected readonly blurEventListener = new EventListenerController(this.host, 'blur', () => this.focusedItemIndex = undefined)

	protected readonly keyDownEventListener = new EventListenerController(this.host, 'keydown', (event: KeyboardEvent) => {
		let prevent = false

		const isFirstList = event.composedPath().find(item => isList(item)) === this.host

		if (!isFirstList) {
			return
		}

		if (event.ctrlKey || event.shiftKey) {
			return
		}

		switch (event.key) {
			case 'Enter':
				this.handleEnter()
				break
			case 'Down':
			case 'ArrowDown':
				this.handleArrowDown()
				prevent = true
				break
			case 'Up':
			case 'ArrowUp':
				this.handleArrowUp()
				prevent = true
				break
			case 'Home':
			case 'PageUp':
				this.handlePageUp()
				prevent = true
				break
			case 'End':
			case 'PageDown':
				this.handlePageDown()
				prevent = true
				break
			case 'Esc':
			case 'Escape':
				this.handleEscape()
				prevent = true
				break
			case 'Tab':
				this.handleTab()
				break
			default:
				break
		}

		if (prevent) {
			event.stopPropagation()
			event.preventDefault()
		}
	})

	protected readonly itemsPointerDownEventListener = new EventListenerController(this.host, {
		target: () => this.host,
		type: 'pointerdown',
		listener: (event: PointerEvent) => {
			const listItem = event.composedPath().find(item => isListItem(item as HTMLElement))
			this.focusedItemIndex = this.getRenderedItemIndex(listItem as ListItem)
		}
	})

	protected handleEnter() {
		// if (this.listboxHasVisualFocus) {
		// 	this.setValue(this.option.textContent)
		// }
		// this.close(true)
		// this.setVisualFocusCombobox()
		// flag = true
	}

	protected handleArrowDown() {
		this.focusNextItem()
		// if (this.filteredOptions.length > 0) {
		// 	if (event.altKey) {
		// 		this.open()
		// 	} else {
		// 		this.open()
		// 		if (
		// 			this.listboxHasVisualFocus ||
		// 			(this.isBoth && this.filteredOptions.length > 1)
		// 		) {
		// 			this.setOption(this.getNextOption(this.option), true)
		// 			this.setVisualFocusListbox()
		// 		} else {
		// 			this.setOption(this.firstOption, true)
		// 			this.setVisualFocusListbox()
		// 		}
		// 	}
		// }
	}

	protected handleArrowUp() {
		this.focusPreviousItem()
		// if (this.hasOptions()) {
		// 	if (this.listboxHasVisualFocus) {
		// 		this.setOption(this.getPreviousOption(this.option), true)
		// 	} else {
		// 		this.open()
		// 		if (!altKey) {
		// 			this.setOption(this.lastOption, true)
		// 			this.setVisualFocusListbox()
		// 		}
		// 	}
		// }
	}

	protected handlePageUp() {
		this.focusFirstItem()
		// if (this.hasOptions()) {
		// 	if (this.listboxHasVisualFocus) {
		// 		this.setOption(this.firstOption, true)
		// 	} else {
		// 		this.open()
		// 		if (!altKey) {
		// 			this.setOption(this.firstOption, true)
		// 			this.setVisualFocusListbox()
		// 		}
		// 	}
		// }
	}

	protected handlePageDown() {
		this.focusLastItem()
		// if (this.hasOptions()) {
		// 	if (this.listboxHasVisualFocus) {
		// 		this.setOption(this.lastOption, true)
		// 	} else {
		// 		this.open()
		// 		if (!altKey) {
		// 			this.setOption(this.lastOption, true)
		// 			this.setVisualFocusListbox()
		// 		}
		// 	}
		// }
	}

	protected handleEscape() {
		// if (this.isOpen()) {
		// 	this.close(true)
		// 	this.filter = this.comboboxNode.value
		// 	this.filterOptions()
		// 	this.setVisualFocusCombobox()
		// } else {
		// 	this.setValue('')
		// 	this.comboboxNode.value = ''
		// }
		// this.option = null
	}

	protected handleTab() {
		// this.close(true)
		// if (this.listboxHasVisualFocus) {
		// 	if (this.option) {
		// 		this.setValue(this.option.textContent)
		// 	}
		// }
	}
}