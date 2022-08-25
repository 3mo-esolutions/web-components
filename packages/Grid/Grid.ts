import { Component, component, css, html, property } from '@a11d/lit'
import type * as CSS from 'csstype'

@component('mo-grid')
export class Grid extends Component {
	private static readonly fromAsteriskSyntax = (value: string) => ` ${value}`.split('*').join('fr').split(' fr').join(' 1fr').substring(1)

	@property()
	get rows() { return this.style.gridTemplateRows }
	set rows(value) { this.style.gridTemplateRows = Grid.fromAsteriskSyntax(value) }

	@property()
	get columns() { return this.style.gridTemplateColumns }
	set columns(value) { this.style.gridTemplateColumns = Grid.fromAsteriskSyntax(value) }

	@property()
	get autoRows() { return this.style.gridAutoRows as CSS.Property.GridAutoRows<string> }
	set autoRows(value) { this.style.gridAutoRows = value }

	@property()
	get autoColumns() { return this.style.gridAutoColumns as CSS.Property.GridAutoColumns<string> }
	set autoColumns(value) { this.style.gridAutoColumns = value }

	@property()
	get rowGap() { return this.style.rowGap as CSS.Property.RowGap<string> }
	set rowGap(value) { this.style.rowGap = value }

	@property()
	get columnGap() { return this.style.columnGap as CSS.Property.ColumnGap<string> }
	set columnGap(value) { this.style.columnGap = value }

	@property()
	get gap() { return this.style.gap as CSS.Property.Gap<string> }
	set gap(value) { this.style.gap = value }

	@property()
	get justifyItems() { return this.style.justifyItems as CSS.Property.JustifyItems }
	set justifyItems(value) { this.style.justifyItems = value }

	@property()
	get justifyContent() { return this.style.justifyContent as CSS.Property.JustifyContent }
	set justifyContent(value) { this.style.justifyContent = value }

	@property()
	get alignItems() { return this.style.alignItems as CSS.Property.AlignItems }
	set alignItems(value) { this.style.alignItems = value }

	@property()
	get alignContent() { return this.style.alignContent as CSS.Property.AlignContent }
	set alignContent(value) { this.style.alignContent = value }

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