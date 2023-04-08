import { Controller, EventListenerController, ReactiveControllerHost, ReactiveElement } from '@a11d/lit'
import { PopoverComponent } from '@3mo/popover'
import { ListElement } from '@3mo/list'

interface MenuElement extends PopoverComponent {
	readonly role: 'menu'
	readonly list: ListElement
}

export class MenuController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost & ReactiveElement & MenuElement) {
		super(host)
	}

	get open() { return this.host.open }
	set open(value) { this.host.open = value }

	getItem(index: number) {
		return this.host.list.getItem?.(index) ?? this.host.list.items[index]
	}

	protected documentClickEventController = new EventListenerController(this.host, {
		type: 'click',
		target: document,
		listener: (event: PointerEvent) => {
			if (event.pointerType === '') {
				return
			}

			if (this.open === true) {
				if (!event.composedPath().includes(this.host)) {
					this.open = false
				}
			} else {
				if (event.composedPath().includes(this.host.anchor)) {
					this.open = true
				}
			}
		}
	})

	protected anchorKeyDownEventController = new EventListenerController(this.host, {
		type: 'keydown',
		target: () => this.host.anchor,
		listener: (event) => {
			if (event.composedPath().includes(this.host.anchor) === false) {
				return
			}

			if (event.ctrlKey || event.shiftKey) {
				return
			}

			switch (event.key) {
				case 'Enter':
				case 'Down':
				case 'ArrowDown':
				case 'Up':
				case 'ArrowUp':
				case 'Home':
				case 'PageUp':
				case 'End':
				case 'PageDown':
					this.open = true
					break
				case 'Esc':
				case 'Escape':
				case 'Tab':
					this.open = false
					break
				default:
					break
			}
		}
	})
}