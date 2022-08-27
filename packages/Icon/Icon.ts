import { Component, html, component, property, css, style } from '@a11d/lit'
import { MaterialIcon } from './index.js'

export const enum IconVariant {
	Filled = 'filled',
	Outlined = 'outlined',
	Sharp = 'sharp',
	Rounded = 'rounded',
}

@component('mo-icon')
export class Icon extends Component {
	static defaultVariant = IconVariant.Filled

	@property({ updated(this: Icon) { MaterialIconFonts.ensureAvailable(this.variant) } }) variant = Icon.defaultVariant
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
			}
		`
	}

	protected override get template() {
		return html`
			<span ${style({ fontFamily: MaterialIconFonts.get(this.variant).name })}>${this.icon}</span>
		`
	}
}

export class MaterialIconFonts {
	private static readonly fontStyleElement = document.createElement('style')
	private static readonly fontUrls = new Set<string>()

	static readonly fontsByVariant = new Map([
		[IconVariant.Filled, { name: 'Material Icons', url: 'https://fonts.googleapis.com/icon?family=Material+Icons' }],
		[IconVariant.Outlined, { name: 'Material Icons Outlined', url: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined' }],
		[IconVariant.Sharp, { name: 'Material Icons Sharp', url: 'https://fonts.googleapis.com/icon?family=Material+Icons+Sharp' }],
		[IconVariant.Rounded, { name: 'Material Icons Round', url: 'https://fonts.googleapis.com/icon?family=Material+Icons+Round' }],
	])

	static get(variant: IconVariant) {
		const font = MaterialIconFonts.fontsByVariant.get(variant)

		if (!font) {
			throw new Error(`No font found for variant ${variant}`)
		}

		return font
	}

	static ensureAvailable(variant: IconVariant) {
		const font = MaterialIconFonts.get(variant)

		if (document.fonts.check(`0 ${font.name}`)) {
			return
		}

		MaterialIconFonts.fontUrls.add(font.url)
		MaterialIconFonts.fontStyleElement.innerHTML = [...MaterialIconFonts.fontUrls].map(url => `@import '${url}';`).join('\n')
		document.head.appendChild(MaterialIconFonts.fontStyleElement)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-icon': Icon
	}
}