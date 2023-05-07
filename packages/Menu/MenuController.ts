import { Component, Controller, EventListenerController, ReactiveControllerHost, ReactiveElement } from '@a11d/lit'
import { Popover } from '@3mo/popover'
import { ListElement } from '@3mo/list'
import { Submenu } from './Submenu.js'

interface MenuElement extends Component {
	readonly role: 'menu'
	readonly anchor: HTMLElement
	readonly popover: Popover
	readonly list: ListElement
	readonly opener?: string
}

export class MenuController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost & ReactiveElement & MenuElement) {
		super(host)
	}

	get open() { return this.host.popover.open ?? false }
	set open(value) { this.host.popover.setOpen(value) }

	getItem(index: number) {
		return this.host.list.getItem?.(index) ?? this.host.list.items[index]
	}

	protected documentClickEventController = new EventListenerController(this.host, {
		type: 'click',
		target: document,
		listener: (event: PointerEvent) => {
			if (event.pointerType !== '') {
				this.setOpen(event, !this.open)
			}
		}
	})

	protected anchorKeyDownEventController = new EventListenerController(this.host, {
		type: 'keydown',
		target: () => this.host.anchor,
		listener: (event: KeyboardEvent) => {
			if (event.ctrlKey || event.shiftKey) {
				return
			}

			switch (event.key) {
				case 'Enter':
					this.setOpen(event, true)
					break
				case 'Down':
				case 'ArrowDown':
				case 'Up':
				case 'ArrowUp':
				case 'Home':
				case 'PageUp':
				case 'End':
				case 'PageDown':
					this.setOpen(event, true, true)
					break
				case 'Esc':
				case 'Escape':
					this.setOpen(event, false)
					event.stopPropagation()
					break
				case 'Tab':
					this.setOpen(event, false)
					break
				case 'Right':
				case 'ArrowRight':
					this.host.anchor instanceof Submenu && this.setOpen(event, getComputedStyle(this.host.anchor).direction === 'ltr')
					break
				case 'Left':
				case 'ArrowLeft':
					this.host.anchor instanceof Submenu && this.setOpen(event, getComputedStyle(this.host.anchor).direction === 'rtl')
					break
				default:
					break
			}
		}
	})

	private setOpen(event: Event, value: boolean, ignoreOpener = false) {
		if (this.open === value) {
			return
		}

		const path = event.composedPath()

		if (!value && !path.includes(this.host)) {
			this.open = value
		}

		if (value && path.includes(this.host.anchor) && !path.includes(this.host)) {
			const openerAllows = ignoreOpener
				|| !this.host.opener
				|| path.some(target => target instanceof Element && target.id === this.host.opener)

			if (openerAllows) {
				this.open = value
			}
		}
	}
}