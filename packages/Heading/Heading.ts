import { component, css, Component, html, property } from '@a11d/lit'

export const enum HeadingTypography {
	Heading1 = 'heading1',
	Heading2 = 'heading2',
	Heading3 = 'heading3',
	Heading4 = 'heading4',
	Heading5 = 'heading5',
	Heading6 = 'heading6',
	Subtitle1 = 'subtitle1',
	Subtitle2 = 'subtitle2',
}

/**
 * @element mo-heading
 *
 * @attr typography - The typography of the heading.
 *
 * @slot - The content of the heading.
 */
@component('mo-heading')
export class Heading extends Component {
	@property({ reflect: true }) typography = HeadingTypography.Heading3

	static override get styles() {
		return css`
			:host { display: block; }

			:host([typography=heading1]) {
				font-size: min(2.5em, 36px);
				letter-spacing: -0.75px;
				font-weight: 300;
			}

			:host([typography=heading2]) {
				font-size: min(2em, 30px);
				letter-spacing: -0.5px;
				font-weight: 300;
			}

			:host([typography=heading3]) {
				font-size: min(1.8em, 24px);
				letter-spacing: -0.25px;
				font-weight: 400;
			}

			:host([typography=heading4]) {
				font-size: min(1.5em, 18px);
				font-weight: 400;
			}

			:host([typography=heading5]) {
				font-size: min(1.17em, 16px);
				font-weight: 500;
			}

			:host([typography=heading6]) {
				font-size: min(1em, 14px);
				letter-spacing: 0.15px;
				font-weight: 500;
			}

			:host([typography=subtitle1]) {
				font-size: min(1.15em, 18px);
				letter-spacing: 0.15px;
				font-weight: 400;
			}

			:host([typography=subtitle2]) {
				font-size: min(1em, 14px);
				letter-spacing: 0.1px;
				font-weight: 400;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-heading': Heading
	}
}