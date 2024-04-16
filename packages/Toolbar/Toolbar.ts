import { Component, component, css, html, property, style } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { ToolbarController } from './index.js'

/**
 * @element mo-toolbar
 *
 * @attr overflowIcon
 * @attr overflowPosition
 * @attr collapsed
 *
 * @csspart pane - The toolbar pane
 * @csspart overflowIcon - The overflow icon
 *
 * @slot - The default slot containing toolbar pane items
 * @slot overflow - The overflow action element(s)
 */
@component('mo-toolbar')
export class Toolbar extends Component {
	@property() overflowIcon: MaterialIcon = 'more_vert'
	@property() overflowPosition: 'end' | 'start' = 'end'
	@property({ type: Boolean, reflect: true }) collapsed = false

	protected readonly toolbarController = new ToolbarController(this)

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

	protected override get template() {
		return html`
			<mo-flex direction='horizontal' alignItems='center' ${style({ display: !this.collapsed ? 'flex' : 'inline-flex' })}>
				${this.paneTemplate}
				<mo-popover-container
					placement='block-end'
					alignment=${(this.collapsed || this.overflowPosition === 'start') ? 'start' : 'end'}
					${style({ flex: '0 0', justifyContent: 'flex-end', order: this.overflowPosition === 'start' ? -1 : 'unset' })}
				>
					<slot name='overflow'>${this.defaultOverflowOpenerTemplate}</slot>
					${this.menuTemplate}
				</mo-popover-container>
			</mo-flex>
		`
	}

	protected get paneTemplate() {
		return html`
			<mo-toolbar-pane part='pane' ${this.toolbarController.pane()}>
				<slot name=${this.toolbarController.paneSlotName}></slot>
			</mo-toolbar-pane>
		`
	}

	protected get defaultOverflowOpenerTemplate() {
		return html`
			<mo-icon-button part='overflowIcon' icon=${this.overflowIcon}
				?disabled=${!this.toolbarController.slotController?.hasAssignedContent(this.toolbarController.overflowContentSlotName)}
			></mo-icon-button>
		`
	}

	protected get menuTemplate() {
		return html`
			<mo-menu slot='popover'>
				<slot name=${this.toolbarController.overflowContentSlotName}></slot>
			</mo-menu>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-toolbar': Toolbar
	}
}