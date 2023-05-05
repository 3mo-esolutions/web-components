import { Component, component, css, event, eventListener, html, property } from '@a11d/lit'
import { Drawer as MwcDrawer } from '@material/mwc-drawer'

/**
 * @element mo-drawer
 *
 * @attr open - Whether the drawer is open
 *
 * @slot - Content of the drawer
 *
 * @fires openChange - When the drawer is opened or closed
 */
@component('mo-drawer')
export class Drawer extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ type: Boolean, reflect: true }) open = false

	protected override get template() {
		return html`
			<mwc-drawer
				type='modal'
				?open=${this.open}
				@MDCDrawer:opened=${() => this.setOpen(true)}
				@MDCDrawer:closed=${() => this.setOpen(false)}
				@MDCDrawer:nav=${() => this.setOpen(!this.open)}
			>
				<slot></slot>
			</mwc-drawer>
		`
	}

	private setOpen(open: boolean) {
		this.open = open
		this.openChange.dispatch(open)
	}

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && this.open) {
			this.setOpen(false)
		}
	}
}

MwcDrawer.elementStyles.push(css`
	:host {
		position: relative;
		color: var(--mo-color-foreground)  !important;
	}

	.mdc-drawer {
		background-color: var(--mo-color-surface);
		top: 0;
	}

	.mdc-drawer__header {
		display: none;
	}

	.mdc-drawer__content {
		scrollbar-color: rgba(128, 128, 128, 0.75) transparent;
		scrollbar-width: thin;
	}

	.mdc-drawer__content::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}

	.mdc-drawer__content::-webkit-scrollbar-thumb {
		background: rgba(128, 128, 128, 0.75);
	}
`)

declare global {
	interface HTMLElementTagNameMap {
		'mo-drawer': Drawer
	}
}