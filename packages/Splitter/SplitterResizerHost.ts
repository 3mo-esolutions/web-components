import { component, html, Component, css, property, event, eventListener } from '@a11d/lit'
import { type Flex } from '@3mo/flex'
import { SlotController } from '@3mo/slot-controller'
import { SplitterResizer } from './index.js'

/**
 * @element mo-splitter-resizer-host
 *
 * @attr direction
 * @attr resizing
 * @attr collapsed
 *
 * @event resizeStart
 * @event resizeStop
 */
@component('mo-splitter-resizer-host')
export class SplitterResizerHost extends Component {
	@event() readonly resizeStart!: EventDispatcher
	@event() readonly resizeStop!: EventDispatcher

	@property({ reflect: true, updated(this: SplitterResizerHost) { !this.resizerElement ? void 0 : this.resizerElement.hostDirection = this.direction } }) direction?: Flex['direction']
	@property({ type: Boolean, reflect: true }) resizing = false
	@property({ type: Boolean, reflect: true }) collapsed = false

	get resizerElement() {
		return this.slotController.getAssignedElements('')
			.find((e): e is SplitterResizer => e instanceof SplitterResizer)
	}

	protected slotController = new SlotController(this)

	@eventListener('mousedown')
	@eventListener('touchstart')
	protected startResize(e: PointerEvent) {
		this.resizing = true
		!this.resizerElement ? void 0 : this.resizerElement.hostResizing = true
		this.resizeStart.dispatch()
		if (e.pointerId) {
			this.setPointerCapture(e.pointerId)
		}
	}

	@eventListener({ target: window, type: 'mouseup' })
	@eventListener({ target: window, type: 'touchend' })
	protected endResize(e: PointerEvent) {
		this.resizing = false
		!this.resizerElement ? void 0 : this.resizerElement.hostResizing = false
		this.resizeStop.dispatch()
		if (e.pointerId) {
			this.releasePointerCapture(e.pointerId)
		}
	}

	@eventListener('pointerenter')
	protected hoverStart() {
		!this.resizerElement ? void 0 : this.resizerElement.hostHover = true
	}

	@eventListener('pointerleave')
	protected hoverEnd() {
		!this.resizerElement ? void 0 : this.resizerElement.hostHover = false
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				background-color: transparent;
				user-select: none;
				align-items: center;
				justify-content: center;
				-webkit-user-select: none;
				-moz-user-select: none;
				transition: 250ms;
			}

			:host([collapsed]) {
				pointer-events: none;
				visibility: collapse;
			}

			:host([direction=horizontal]), :host([direction=horizontal-reversed]) {
				cursor: col-resize;
			}

			:host([direction=vertical]), :host([direction=vertical-reversed]) {
				cursor: row-resize;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-splitter-resizer-host': SplitterResizerHost
	}
}