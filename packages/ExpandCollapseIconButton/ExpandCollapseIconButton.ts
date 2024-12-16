import { component, css, Component, html, property } from '@a11d/lit'
import '@3mo/icon-button'

/**
 * @element mo-expand-collapse-icon-button
 *
 * @ssr true
 *
 * @attr disabled
 * @attr open
 */
@component('mo-expand-collapse-icon-button')
export class ExpandCollapseIconButton extends Component {
	@property({ type: Boolean, reflect: true }) disabled = false
	@property({ type: Boolean, reflect: true }) open = false

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				view-transition-name: mo-expand-collapse-icon-button;
			}

			mo-icon-button {
				transition: 250ms;
			}

			:host([open]) mo-icon-button {
				transform: rotate(180deg);
			}
		`
	}

	protected override get template() {
		return html`<mo-icon-button dense icon='expand_more' ?disabled=${this.disabled}></mo-icon-button>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-expand-collapse-icon-button': ExpandCollapseIconButton
	}
}