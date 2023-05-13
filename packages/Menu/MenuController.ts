import { Controller, EventListenerController } from '@a11d/lit'
import type { Menu } from './Menu.js'

export class MenuController extends Controller {
	constructor(protected override readonly host: Menu) {
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
		target: () => this.host.anchor || [],
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
				default:
					break
			}
		}
	})

	private setOpen(event: Event, value: boolean, ignoreOpener = false) {
		if (this.open === value) {
			return
		}

		if (value && this.host.manualOpen) {
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