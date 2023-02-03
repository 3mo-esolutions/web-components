import { EventListenerController, Controller, ReactiveControllerHost, ReactiveElement } from '@a11d/lit'

interface ElementWithItems extends HTMLElement {
	readonly items: Array<HTMLElement>
}

export class ListItemsKeyboardController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost & ReactiveElement & ElementWithItems) {
		super(host)
	}

	private get items() {
		return this.host.items
	}

	override hostConnected() {
		this.host.tabIndex = 0
		this.items.forEach(item => item.tabIndex = -1)
	}

	override hostDisconnected() {
		this.host.tabIndex = -1
	}

	protected readonly focusEventListener = new EventListenerController(this.host, 'focus', () => this.focusedItem ??= this.items[0])

	protected readonly blurEventListener = new EventListenerController(this.host, 'blur', () => this.focusedItem = undefined)

	protected readonly keyDownEventListener = new EventListenerController(this.host, 'keydown', (event: KeyboardEvent) => {
		let prevent = false

		if (event.ctrlKey || event.shiftKey) {
			return
		}

		switch (event.key) {
			case 'Enter':
				return this.handleEnterKey()
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
		target: () => this.items,
		type: 'pointerdown',
		listener: (event: PointerEvent) => this.focusedItem = event.target as HTMLElement
	})

	get focusedItem() { return this.items.find(item => item.hasAttribute('focused')) }
	set focusedItem(value) {
		for (const item of this.items) {
			if (item === value) {
				item.setAttribute('focused', '')
			} else {
				item.removeAttribute('focused')
			}
		}
	}

	protected focusFirstItem() {
		this.focusedItem = this.items[0]
	}

	protected focusLastItem() {
		this.focusedItem = this.items[this.items.length - 1]
	}

	protected focusNextItem() {
		const activeIndex = !this.focusedItem ? -1 : this.items.indexOf(this.focusedItem)
		const nextIndex = activeIndex === this.items.length - 1 ? 0 : activeIndex + 1
		this.focusedItem = this.items[nextIndex]
	}

	protected focusPreviousItem() {
		const activeIndex = !this.focusedItem ? this.items.length : this.items.indexOf(this.focusedItem)
		const previousIndex = activeIndex === 0 ? this.items.length - 1 : activeIndex - 1
		this.focusedItem = this.items[previousIndex]
	}

	protected handleEnterKey() {
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