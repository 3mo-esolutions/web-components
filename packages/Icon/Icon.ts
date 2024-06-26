import { Component, html, component, property, css, style } from '@a11d/lit'
import { FontImporter } from '@3mo/font-importer'
import { type MaterialIcon } from './index.js'

export enum IconVariant {
	Filled = 'filled',
	Outlined = 'outlined',
	Sharp = 'sharp',
	Rounded = 'rounded',
}

/**
 * @element mo-icon
 *
 * @ssr true - The font should be provided manually when using SSR.
 *
 * @attr variant - The variant of the icon tied to a specific font.
 * @attr icon - The icon to display.
 */
@component('mo-icon')
export class Icon extends Component {
	static defaultVariant = IconVariant.Filled

	static readonly fontsByVariant = new Map([
		[IconVariant.Filled, { name: 'Material Icons', url: 'https://fonts.googleapis.com/icon?family=Material+Icons' }],
		[IconVariant.Outlined, { name: 'Material Icons Outlined', url: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined' }],
		[IconVariant.Sharp, { name: 'Material Icons Sharp', url: 'https://fonts.googleapis.com/icon?family=Material+Icons+Sharp' }],
		[IconVariant.Rounded, { name: 'Material Icons Round', url: 'https://fonts.googleapis.com/icon?family=Material+Icons+Round' }],
	])

	private static get(variant: IconVariant) {
		const font = Icon.fontsByVariant.get(variant)

		if (!font) {
			throw new Error(`No font found for variant ${variant}`)
		}

		return font
	}

	@property({ updated(this: Icon) { FontImporter.import(Icon.get(this.variant).url) } }) variant = Icon.defaultVariant
	@property() icon?: MaterialIcon

	static override get styles() {
		return css`
			:host {
				display: inline-grid;
				font-size: 24px;
			}

			span {
				font-weight: normal;
				font-style: normal;
				line-height: 1;
				letter-spacing: normal;
				text-transform: none;
				display: inline-block;
				white-space: nowrap;
				word-wrap: normal;
				direction: ltr;
				-webkit-font-smoothing: antialiased;
				text-rendering: optimizeLegibility;
				-moz-osx-font-smoothing: grayscale;
				font-feature-settings: "liga";
				user-select: none;
			}
		`
	}

	protected override get template() {
		return html`
			<span ${style({ fontFamily: Icon.get(this.variant).name })}>${this.icon}</span>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-icon': Icon
	}
}