import { List } from '@3mo/list'
import { component, css, html, unsafeCSS } from '@a11d/lit'

@component('mo-toolbar-pane')
export class ToolbarPane extends List {
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
					flex: 1 1;
					align-self: stretch;
				}

			:host(:focus) {
				outline: none;
			}

			#filler {
				content: '';
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
				<div id='filler'></div>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar-pane': ToolbarPane
	}
}