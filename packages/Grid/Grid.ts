import { Component, component, css, html } from '@a11d/lit'
import { styleProperty } from '@3mo/style-property'
import type * as CSS from 'csstype'

const asteriskSyntaxConverter = {
	fromStyle: (value: string) => value,
	toStyle: (value: string) => value.replace(/(\d*)\*/g, (_, p1) => `${p1 || '1'}fr`).trim(),
}

/**
 * A grid container whose attributes set the grid properties of its host.
 *
 * @element mo-grid
 *
 * @ssr true
 *
 * @attr rows - The row tracks, mapped to `grid-template-rows`; `*` stands for `1fr` and `2*` for `2fr`
 * @attr columns - The column tracks, mapped to `grid-template-columns`; `*` stands for `1fr` and `2*` for `2fr`
 * @attr autoRows - The size of implicitly created rows, mapped to `grid-auto-rows`
 * @attr autoColumns - The size of implicitly created columns, mapped to `grid-auto-columns`
 * @attr autoFlow - How items are placed automatically, mapped to `grid-auto-flow`
 * @attr rowGap - The gap between rows, mapped to `row-gap`
 * @attr columnGap - The gap between columns, mapped to `column-gap`
 * @attr gap - The gap between rows and columns, mapped to `gap`
 * @attr justifyItems - Places the items in their cells along the inline axis, mapped to `justify-items`
 * @attr justifyContent - Places the tracks along the inline axis, mapped to `justify-content`
 * @attr alignItems - Places the items in their cells along the block axis, mapped to `align-items`
 * @attr alignContent - Places the tracks along the block axis, mapped to `align-content`
 *
 * @slot - The content of the grid container.
 */
@component('mo-grid')
export class Grid extends Component {
	@styleProperty({ styleKey: 'gridTemplateRows', styleConverter: asteriskSyntaxConverter }) rows!: CSS.Property.GridTemplateRows<string>
	@styleProperty({ styleKey: 'gridTemplateColumns', styleConverter: asteriskSyntaxConverter }) columns!: CSS.Property.GridTemplateColumns<string>
	@styleProperty({ styleKey: 'gridAutoRows' }) autoRows!: CSS.Property.GridAutoRows<string>
	@styleProperty({ styleKey: 'gridAutoColumns' }) autoColumns!: CSS.Property.GridAutoColumns<string>
	@styleProperty({ styleKey: 'gridAutoFlow' }) autoFlow!: CSS.Property.GridAutoFlow
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

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-grid': Grid
	}
}