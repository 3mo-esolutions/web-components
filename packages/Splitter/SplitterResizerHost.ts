import { component, html, Component, css, property } from '@a11d/lit'
import { type Flex } from '@3mo/flex'
import { SlotController } from '@3mo/slot-controller'
import { PointerController } from '@3mo/pointer-controller'
import { SplitterResizer } from './index.js'

/**
 * @element mo-splitter-resizer-host
 *
 * @attr direction
 * @attr resizing
 * @attr locked
 */
@component('mo-splitter-resizer-host')
export class SplitterResizerHost extends Component {
	@property({ reflect: true, updated(this: SplitterResizerHost) { !this.resizerElement ? void 0 : this.resizerElement.hostDirection = this.direction } }) direction?: Flex['direction']
	@property({ type: Boolean, reflect: true, attribute: 'data-resizing', updated(this: SplitterResizerHost) { this.resizingUpdated() } }) resizing = false
	@property({ type: Boolean, reflect: true }) locked = false

	get resizerElement() {
		return this.slotController.getAssignedElements('')
			.find((e): e is SplitterResizer => e instanceof SplitterResizer)
	}

	protected slotController = new SlotController(this)
	protected pointerController = new PointerController(this, {
		handleHoverChange: hover => !this.resizerElement ? void 0 : this.resizerElement.hostHover = hover,
	})

	private resizingUpdated() {
		if (this.resizerElement) {
			this.resizerElement.hostResizing = this.resizing
		}
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

			:host([locked]) {
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