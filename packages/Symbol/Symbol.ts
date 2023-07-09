import { Component, html, component, property, css, style } from '@a11d/lit'
import { MaterialSymbolController, SymbolVariant } from './MaterialSymbolController.js'
import { MaterialSymbol } from './index.js'

@component('mo-symbol')
export class Symbol extends Component {
	static defaultVariant = SymbolVariant.Rounded
	static defaultFill?: string
	static defaultWeight?: string
	static defaultGrade?: string
	static defaultOpticalScale?: string

	// eslint-disable-next-line @typescript-eslint/ban-types
	@property({ updated(this: Symbol) { this.materialIconController.ensureFontsAvailable(this.variant) } }) variant = Symbol.defaultVariant
	@property() fill? = Symbol.defaultFill
	@property() weight? = Symbol.defaultWeight
	@property() grade? = Symbol.defaultGrade
	@property() opticalScale? = Symbol.defaultOpticalScale

	@property() icon?: MaterialSymbol

	private readonly materialIconController = new MaterialSymbolController()

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
			}
		`
	}

	protected override get template() {
		const styleDirective = style({
			fontFamily: `Material Symbols ${this.variant}`,
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
		// eslint-disable-next-line @typescript-eslint/ban-types
		'mo-symbol': Symbol
	}
}