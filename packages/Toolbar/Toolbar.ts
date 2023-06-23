import { Component, component, css, html, property, style } from '@a11d/lit'
import { MaterialIcon } from '@3mo/icon'
import { ToolbarController } from './index.js'

/**
 * @attr overflowIcon
 * @attr overflowPosition
 * @attr collapsed
 * @csspart overflowIcon
 */
@component('mo-toolbar')
export class Toolbar extends Component {
	@property() overflowIcon: MaterialIcon = 'more_vert'
	@property() overflowPosition: 'end' | 'start' = 'end'
	@property({ type: Boolean, reflect: true }) collapsed = false

	protected toolbarController = new ToolbarController(this)

	static override get styles() {
		return css`
			mo-toolbar-pane {
				flex: 1 1;
			}

			:host([collapsed]) mo-toolbar-pane {
				display: none
			}
		`
	}

	override get template() {
		return html`
			<mo-flex direction='horizontal' alignItems='center' ${style({ display: !this.collapsed ? 'flex' : 'inline-flex' })}>
				${this.toolbarController.paneTemplate}
				<mo-popover-container
					placement='block-end'
					alignment=${(this.collapsed || this.overflowPosition === 'start') ? 'start' : 'end'}
					${style({ flex: '0 0', justifyContent: 'flex-end', order: this.overflowPosition === 'start' ? -1 : 'unset' })}
				>
					<slot name='overflow-button'>
						<mo-icon-button icon=${this.overflowIcon} part='overflowIcon'
						?disabled=${!this.toolbarController.slotController?.getAssignedElements(this.toolbarController.overflowSlot).length}
						></mo-icon-button>
					</slot>
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