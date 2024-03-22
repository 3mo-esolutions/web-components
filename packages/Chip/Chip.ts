import { component, css, html, Component } from '@a11d/lit'
import '@3mo/theme'
import '@3mo/button'

/**
 * @element mo-chip
 *
 * @ssr true
 *
 * @slot - The default slot.
 * @slot leading - The icon slot.
 * @slot trailing - The icon slot.
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
				--mo-button-accent-color: var(--mo-chip-background-color, rgba(var(--mo-color-foreground-base), 0.15));
				--mo-button-on-accent-color: var(--mo-chip-foreground-color, rgba(var(--mo-color-foreground-base), 0.8));
				--mo-button-horizontal-padding: 10px;
				height: 100%;
				min-height: auto;
				border-radius: inherit;
				text-transform: none;
			}

			mo-button::part(button) {
				font-weight: auto;
				letter-spacing: normal;
				text-decoration: auto;
			}

			::slotted(mo-icon-button) {
				font-size: 20px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-button type='unelevated' exportparts='ripple'>
				<slot name='leading' slot='leading'></slot>
				<slot></slot>
				<slot name='trailing' slot='trailing'></slot>
			</mo-button>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-chip': Chip
	}
}