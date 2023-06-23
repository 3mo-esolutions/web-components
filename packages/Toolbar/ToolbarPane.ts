import { List } from '@3mo/list'
import { observeResize } from '@3mo/resize-observer'
import { component, css, html, unsafeCSS, event } from '@a11d/lit'

/**
 * @fires fillerResize
 */
@component('mo-toolbar-pane')
export class ToolbarPane extends List {
	@event() readonly fillerResize!: EventDispatcher<ResizeObserverEntry[]>

	get unfilteredItems() {
		return this.slotController.getAssignedElements('')
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				overflow: clip;
			}

				${unsafeCSS(this.itemRoles.map(x => `::slotted([role=${x}])`).join(', '))} {
					flex: 1 1 0%;
					text-overflow: ellipsis;
					white-space: nowrap;
					align-self: stretch;
				}

			:host(:focus) {
				outline: none;
			}

			#filler {
				align-self: stretch;
				flex: 0 1 100%;
			}
		`
	}

	protected override handleSlotChange() {
		this.itemsChange.dispatch(this.unfilteredItems.map(x => x as HTMLElement))
	}

	protected override get template() {
		return html`
			<mo-flex direction='horizontal' alignItems='center'>
				${super.template}
				<div id='filler' ${observeResize(elems => this.fillerResize.dispatch(elems))}></div>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar-pane': ToolbarPane
	}
}