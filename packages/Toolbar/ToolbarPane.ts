import { Component, component, css, html, event } from '@a11d/lit'
import { observeResize } from '@3mo/resize-observer'
import { SlotController } from '@3mo/slot-controller'
import '@3mo/flex'

/**
 * @fires fillerResize
 * @fires itemsChange
 */
@component('mo-toolbar-pane')
export class ToolbarPane extends Component {
	@event() readonly fillerResize!: EventDispatcher<Array<ResizeObserverEntry>>
	@event() readonly itemsChange!: EventDispatcher

	readonly slotController = new SlotController(this)

	get items() { return this.slotController.getAssignedElements('') }

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				flex: 1 1 0;
				width: 0;
				overflow: clip;
			}

			:host(:focus) {
				outline: none;
			}

			mo-flex {
				overflow: clip;
				flex-direction: row;
				align-items: center;
				align-content: center;
			}

			::slotted(*) {
				flex: 0 0 0%;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			#filler {
				flex: 0 1 100%;
				align-self: stretch;
			}

			#pad {
				flex: 0 0 1px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex part='pane'>
				<div id='pad'></div>
				<slot @slotchange=${() => this.itemsChange.dispatch()}></slot>
				<div id='filler' ${observeResize(elements => this.fillerResize.dispatch(elements))}></div>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar-pane': ToolbarPane
	}
}