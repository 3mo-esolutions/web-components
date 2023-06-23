import { Component, component, css, html, nothing, property, style } from '@a11d/lit'
import { ToolbarController } from './index.js'

@component('mo-toolbar')
export class Toolbar extends Component {
	@property({ type: Boolean, reflect: true }) collapsed = false

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
			<mo-flex direction='horizontal' alignItems='center' ${style({ display: !this.collapsed ? 'flex' : 'inline-flex' })}>
				${this.collapsed ? nothing : this.toolbarController.paneTemplate}
				<mo-popover-container placement='block-end' alignment='end' style='flex: 0 0; justify-content: flex-end;'>
					<mo-menu slot='popover'>
						${this.toolbarController.overflowTemplate}
					</mo-menu>
					<slot name='overflow-button'>
						<mo-icon-button icon='more_vert'
							?disabled=${!this.toolbarController.slotController?.getAssignedElements(this.toolbarController.overflowSlot).length}
						></mo-icon-button>
					</slot>
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