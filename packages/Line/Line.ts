import { component, Component, css, html, property } from '@a11d/lit'

/**
 * @element mo-line
 *
 * @prop direction - The direction of the line. Default is `horizontal`.
 *
 * @slot - The content of the line.
 */
@component('mo-line')
export class Line extends Component {
	@property({ type: String, reflect: true }) direction: 'horizontal' | 'vertical' = 'horizontal'

	override role: 'separator' | 'presentation' = 'separator'

	static override get styles() {
		return css`
			:host {
				display: flex;
				align-items: center;
				text-align: center;
				color: color-mix(in srgb, currentColor 80%, transparent 16%);
			}

			:host([direction=vertical]) {
				flex-direction: column;
			}

			:host(:not(:empty)) {
				gap: .5em;
			}

			:host::before, :host::after {
				content: '';
				display: inline-block;
				flex: 1;
			}

			:host([direction=horizontal])::before, :host([direction=horizontal])::after {
				border-block-end: 1px solid color-mix(in srgb, currentColor, transparent 88%);
			}

			:host([direction=vertical])::before, :host([direction=vertical])::after {
				height: 100%;
				border-inline-end: 1px solid color-mix(in srgb, currentColor, transparent 88%);
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-line': Line
	}
}