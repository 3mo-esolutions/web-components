import { css, component, html } from '@a11d/lit'
import { DialogProgress } from '../index.js'

/** A progress dialog that waits for a card payment, with a pulsing contactless icon in place of the spinner. */
@component('story-payment-dialog')
export class PaymentDialog<T> extends DialogProgress<T> {
	static override get styles() {
		return css`
			${super.styles}

			#indicator {
				display: grid;
				place-items: center;
				width: 100px;
				aspect-ratio: 1;
				margin: 50px;
				border-radius: 50%;
				background: var(--mo-color-accent);
				color: var(--mo-color-on-accent);
				position: relative;

				&::before, &::after {
					content: '';
					position: absolute;
					inset: 0;
					border: 2.5px solid var(--mo-color-accent);
					border-radius: 50%;
					animation: ripple 2s linear infinite;
				}

				&::after {
					animation-delay: 1s;
				}
			}

			@keyframes ripple {
				from { scale: 1; opacity: 1; }
				to { scale: 2; opacity: 0; }
			}

			@media (prefers-reduced-motion: reduce) {
				#indicator::before, #indicator::after {
					animation: none;
				}
			}
		`
	}

	protected override get indicatorTemplate() {
		return html`
			<div id='indicator'>
				<mo-icon icon='contactless' style='font-size: 42px'></mo-icon>
			</div>
		`
	}
}
