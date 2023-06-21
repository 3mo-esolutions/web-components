import { List } from '@3mo/list'
import { component, css, html, unsafeCSS } from '@a11d/lit'

@component('mo-toolbar-pane')
class ToolbarPane extends List {
	static override get styles() {
		return css`
			:host {
				display: flex;
				align-items: center;
				justify-content: flex-start;
			}

				${unsafeCSS(this.itemRoles.map(x => `::slotted(*[role=${x}])`).join(', '))} {
					flex: 1 1;
					align-self: stretch;
				}

			:host(:focus) {
				outline: none;
			}

			#pusher {
				content: '';
				flex: 0 1 100%;
			}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			<div id='pusher'></div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar-pane': ToolbarPane
	}
}