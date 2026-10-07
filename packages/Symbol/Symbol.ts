import { Component, html, component, property, css, style } from '@a11d/lit'
import { FontImporter } from '@3mo/font-importer'
import type { MaterialSymbol } from './MaterialSymbol.js'

export enum SymbolVariant {
	Outlined = 'outlined',
	Sharp = 'sharp',
	Rounded = 'rounded',
}

/**
 * A Material symbol, drawn from the variable Material Symbols font by name.
 *
 * @element mo-symbol
 *
 * @ssr true - The font should be provided manually when using SSR.
 *
 * @attr variant - The style, each a font of its own: `rounded` (default), `outlined` or `sharp`.
 * @attr icon - The name of the symbol, e.g. `delete`.
 * @attr fill - `1` fills the symbol, `0` outlines it.
 * @attr weight - The stroke weight, from `100` to `700`.
 * @attr grade - Fine-tunes the stroke thickness without changing the size, from `-50` to `200`.
 * @attr opticalScale - The size in pixels the strokes are optimized for, from `20` to `48`.
 */
@component('mo-symbol')
export class Symbol extends Component {
	static defaultVariant = SymbolVariant.Rounded
	static defaultFill?: string
	static defaultWeight?: string
	static defaultGrade?: string
	static defaultOpticalScale?: string

	private static readonly fontUrlByVariant = new Map<SymbolVariant, { readonly name: string, readonly url: string }>([
		[SymbolVariant.Outlined, { name: 'Material Symbols Outlined', url: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' }],
		[SymbolVariant.Sharp, { name: 'Material Symbols Sharp', url: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' }],
		[SymbolVariant.Rounded, { name: 'Material Symbols Rounded', url: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' }],
	])

	private static get(variant: SymbolVariant) {
		const font = Symbol.fontUrlByVariant.get(variant)

		if (!font) {
			throw new Error(`No font found for variant ${variant}`)
		}

		return font
	}

	@property({ updated(this: Symbol) { FontImporter.import(Symbol.get(this.variant).url) } }) variant = Symbol.defaultVariant
	@property() fill? = Symbol.defaultFill
	@property() weight? = Symbol.defaultWeight
	@property() grade? = Symbol.defaultGrade
	@property() opticalScale? = Symbol.defaultOpticalScale

	@property() icon?: MaterialSymbol

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
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
		const styleDirective = style({
			fontFamily: Symbol.get(this.variant).name,
			fontVariationSettings: [
				!this.fill ? '' : `'FILL' ${this.fill}`,
				!this.weight ? undefined : `'wght' ${this.weight}`,
				!this.grade ? undefined : `'GRAD' ${this.grade}`,
				!this.opticalScale ? undefined : `'opsz' ${this.opticalScale}`,
			].filter(Boolean).join(', ') || undefined,
		})
		return html`
			<span ${styleDirective}>${this.icon}</span>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-symbol': Symbol
	}
}
