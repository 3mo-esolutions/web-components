import { Controller, type ReactiveElement, eventListener } from '@a11d/lit'
import type { Flex } from '@3mo/flex'

async function targetResizerElements(this: SplitterController) {
	await this.host.updateComplete
	return this.resizerElements
}

export class SplitterController extends Controller {
	constructor(override readonly host: ReactiveElement, private readonly options: {
		readonly resizerElements: () => Array<ReactiveElement>
		readonly resizingElements: () => Array<ReactiveElement>
	}) { super(host) }

	get direction(): Flex['direction'] {
		return 'direction' in this.host ? this.host.direction as Flex['direction'] : 'horizontal'
	}

	get isHorizontal() {
		return this.direction === 'horizontal' || this.direction === 'horizontal-reversed'
	}

	get sizeProperty() {
		return this.direction === 'horizontal' || this.direction === 'horizontal-reversed' ? 'width' : 'height'
	}

	get resizerElements() {
		return this.options.resizerElements()
	}

	get resizingElements() {
		return this.options.resizingElements()
	}

	private _resizing = false
	get resizing() { return this._resizing }
	set resizing(value: boolean) {
		if (this._resizing !== value) {
			this._resizing = value
			this.host.toggleAttribute('data-resizing', value)
		}
	}

	private resizeRequestEvent?: TouchEvent | PointerEvent
	private resizingResizer?: ReactiveElement

	@eventListener({ target: window, type: 'pointermove' })
	@eventListener({ target: window, type: 'touchmove', options: { passive: false } as any })
	protected requestResize(e: TouchEvent | PointerEvent) {
		if (this.resizing) {
			e.preventDefault()
			this.resizeRequestEvent = e
			requestAnimationFrame(() => this.resize())
		}
	}

	@eventListener({ type: 'mousedown', target: targetResizerElements })
	@eventListener({ type: 'touchstart', target: targetResizerElements })
	protected startResize(e: MouseEvent | TouchEvent) {
		this.resizing = true
		for (const resizer of this.resizerElements) {
			const isResizer = e.composedPath().includes(resizer)
			resizer.toggleAttribute('data-resizing', isResizer)
			if (isResizer) {
				this.resizingResizer = resizer
			}
		}
	}

	@eventListener({ target: window, type: 'mouseup' })
	@eventListener({ target: window, type: 'touchend' })
	protected endResize() {
		this.resizing = false
		for (const resizer of this.resizerElements) {
			resizer.removeAttribute('data-resizing')
		}
	}

	protected resize() {
		const resizingResizer = this.resizingResizer
		const resizingItem = !resizingResizer ? undefined : this.resizingElements[this.resizerElements.indexOf(resizingResizer)]

		if (!resizingItem) {
			return
		}

		const oldTotalSize = this.host.getBoundingClientRect()[this.sizeProperty]
		const e = this.resizeRequestEvent!

		// Don't check for instanceof TouchEvent, as Safari doesn't understand it
		const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
		const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
		const { left, top, right, bottom } = resizingItem.getBoundingClientRect()

		const getSize = () => {
			switch (this.direction) {
				case 'horizontal':
					return clientX - left
				case 'horizontal-reversed':
					return right - clientX
				case 'vertical':
					return clientY - top
				case 'vertical-reversed':
					return bottom - clientY
			}
		}

		(resizingItem as any).size = `${getSize() / oldTotalSize * 100}%`
		// resizingItem.style[this.sizeProperty] = `${getSize() / oldTotalSize * 100}%`
	}
}