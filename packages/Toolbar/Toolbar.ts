import { Component, component, css, html } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { ToolbarController } from './index.js'

@component('mo-toolbar')
export class Toolbar extends Component {
	protected toolbarController = new ToolbarController(this)

	static override get styles() {
		return css`
			mo-toolbar-pane {
				flex: 1 1;
			}
		`
	}

	override get template() {
		return html`
			<mo-flex direction='horizontal' alignItems='center'>
				${this.toolbarController.paneTemplate}
				<mo-popover-container placement='block-end' alignment='end' style='flex: 0 0; justify-content: flex-end;'>
					<mo-icon-button icon='more_vert' ${tooltip('More')}></mo-icon-button>
					<mo-menu slot='popover'>
						${this.toolbarController.overflowTemplate}
					</mo-menu>
				</mo-popover-container>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar': Toolbar
	}
}