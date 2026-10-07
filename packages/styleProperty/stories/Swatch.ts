import { Component, component, css, html } from '@a11d/lit'
import { styleProperty } from '@3mo/style-property'

/** A color swatch whose properties live in its inline style, where CSS reads them. */
@component('story-swatch')
export class Swatch extends Component {
	@styleProperty({ styleKey: '--story-swatch-color' }) color!: string

	@styleProperty({
		styleKey: 'inlineSize',
		type: Number,
		styleConverter: {
			toStyle: (size: number) => `${size}px`,
			fromStyle: (style: string) => parseFloat(style),
		},
	}) size!: number

	static override get styles() {
		return css`
			:host {
				display: block; inline-size: 48px; aspect-ratio: 1;
				border-radius: var(--mo-border-radius); background: var(--story-swatch-color, var(--mo-color-accent));
			}
		`
	}

	protected override get template() {
		return html``
	}
}
