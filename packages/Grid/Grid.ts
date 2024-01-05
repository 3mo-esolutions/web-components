import { Component, component, css, html } from '@a11d/lit'
import { styleProperty } from '@3mo/style-property'
import type * as CSS from 'csstype'

const asteriskSyntaxConverter = {
	fromStyle: (value: string) => value,
	toStyle: (value: string) => value.replace(/(\d*)\*/g, (_, p1) => `${p1 || '1'}fr`).trim(),
}

/**
 * @element mo-grid
 *
 * @ssr true
 *
 * @attr rows
 * @attr columns
 * @attr autoRows
 * @attr autoColumns
 * @attr rowGap
 * @attr columnGap
 * @attr gap
 * @attr justifyItems
 * @attr justifyContent
 * @attr alignItems
 * @attr alignContent
 *
 * @slot - The content of the grid container.
 */
@component('mo-grid')
export class Grid extends Component {
	@styleProperty({ styleKey: 'gridTemplateRows', styleConverter: asteriskSyntaxConverter }) rows!: CSS.Property.GridTemplateRows<string>
	@styleProperty({ styleKey: 'gridTemplateColumns', styleConverter: asteriskSyntaxConverter }) columns!: CSS.Property.GridTemplateColumns<string>
	@styleProperty({ styleKey: 'gridAutoRows' }) autoRows!: CSS.Property.GridAutoRows<string>
	@styleProperty({ styleKey: 'gridAutoColumns' }) autoColumns!: CSS.Property.GridAutoColumns<string>
	@styleProperty() rowGap!: CSS.Property.RowGap<string>
	@styleProperty() columnGap!: CSS.Property.ColumnGap<string>
	@styleProperty() gap!: CSS.Property.Gap<string>
	@styleProperty() justifyItems!: CSS.Property.JustifyItems
	@styleProperty() justifyContent!: CSS.Property.JustifyContent
	@styleProperty() alignItems!: CSS.Property.AlignItems
	@styleProperty() alignContent!: CSS.Property.AlignContent

	static override get styles() {
		return css`:host { display: grid; }`
	}

	override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-grid': Grid
	}
}