import { component, css, html, Component } from '@a11d/lit'
import '@3mo/theme'
import '@3mo/button'

/**
 * @element mo-chip
 *
 * @ssr true
 *
 * @slot - The default slot.
 * @slot start - The icon slot.
 * @slot end - The icon slot.
 *
 * @cssprop --mo-chip-background-color - The background color of the chip.
 * @cssprop --mo-chip-foreground-color - The foreground color of the chip.
 *
 * @csspart ripple - The ripple element.
 */
@component('mo-chip')
export class Chip extends Component {
	static override get styles() {
		return css`
			:host {
				display: inline-block;
				min-height: 30px;
				border-radius: 16px;
			}

			mo-button {
				--mo-button-accent-color: var(--mo-chip-background-color, color-mix(in srgb, var(--mo-color-foreground), transparent 85%));
				--mo-button-on-accent-color: var(--mo-chip-foreground-color, color-mix(in srgb, var(--mo-color-foreground), transparent 20%));
				--mo-button-horizontal-padding: 10px;
				height: 100%;
				min-height: auto;
				border-radius: inherit;
				text-transform: none;
			}

			mo-button::part(button) {
				font-weight: auto;
				text-decoration: auto;
			}

			::slotted(mo-icon-button) {
				font-size: 20px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-button type='filled' exportparts='ripple'>
				<slot name='start' slot='start'></slot>
				<slot></slot>
				<slot name='end' slot='end'></slot>
			</mo-button>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-chip': Chip
	}
}