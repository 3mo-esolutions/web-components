import { Component, component, css, html, property } from '@a11d/lit'

/**
 * @element mo-list-item-ripple
 *
 * @attr disabled - Whether the ripple is disabled
 */
@component('mo-list-item-ripple')
export class ListItemRipple extends Component {
	@property({ type: Boolean }) disabled = false

	static override get styles() {
		return css`
			:host {
				display: block;
				position: absolute;
				border-radius: inherit;
				inset: 0;
				width: 100%;
				height: 100%;
				--_color: color-mix(in srgb, var(--mo-color-gray), var(--mo-color-accent) 25%);
				--md-ripple-focus-color: var(--_color);
				--md-ripple-hover-color: var(--_color);
				--md-ripple-pressed-color: var(--_color);
			}

			md-ripple {
				display: block;
				width: 100%;
				height: 100%;
				pointer-events: none;
			}

			div {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
			}
		`
	}

	protected override get template() {
		return html`
			<div></div>
			<md-ripple .control=${this} ?disabled=${this.disabled}></md-ripple>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-item-ripple': ListItemRipple
	}
}