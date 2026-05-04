import { component, css, html, Component, eventListener } from '@a11d/lit'
import { styleProperty } from '@3mo/style-property'
import type * as CSS from 'csstype'

/**
 * @slot - The content of the scroller
 *
 * @attr snapType - The scroll snap type
 *
 * @cssprop --mo-scroller-thumb-color - The color of the scroller thumb
 * @cssprop --mo-scroller-track-color - The color of the scroller track
 */
@component('mo-scroller')
export class Scroller extends Component {
	@styleProperty({ styleKey: 'scrollSnapType' }) snapType?: CSS.Property.ScrollSnapType

	static readonly scrollbarStyles = css`
		:host {
			scrollbar-color: var(--mo-scroller-thumb-color, rgba(128, 128, 128, 0.75)) var(--mo-scroller-track-color, transparent);
			scrollbar-width: thin;
		}

		:host::-webkit-scrollbar {
			width: 5px;
			height: 5px;
		}

		:host::-webkit-scrollbar-thumb {
			background: var(--mo-scroller-thumb-color, rgba(128, 128, 128, 0.75));
		}
	`

	static override get styles() {
		return css`
			:host {
				/* 'overlay' is not supported in FireFox so it fallbacks to auto, otherwise overlay is set */
				overflow: auto;
				overflow: overlay;
				min-width: 0;
				min-height: 0;
				display: block;
			}

			${Scroller.scrollbarStyles}
		`
	}

	@eventListener({ type: 'scroll', options: { passive: true } })
	protected handleScroll(e: Event) {
		// https://devdoc.net/web/developer.mozilla.org/en-US/docs/Web/Events/scroll.html
		window.dispatchEvent(new Event('scroll', e))
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-scroller': Scroller
	}
}