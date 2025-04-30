import { component, html, ifDefined, property, style } from '@a11d/lit'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'

/**
 * @element mo-data-grid-column-image
 *
 * @attr tooltipSelector - The data selector of the column to use as a tooltip. If a function is provided, it will be called with the data as an argument.
 */
@component('mo-data-grid-column-image')
export class DataGridColumnImage<TData> extends DataGridColumnComponent<TData, string> {
	@property() tooltipSelector?: KeyPath.Of<TData> | ((data: TData) => string | undefined)

	override nonSortable = true
	override nonEditable = true

	getContentTemplate(value: string | undefined, data: TData) {
		if (!value) {
			return html.nothing
		}

		const tooltipText = this.getTooltipText(data)

		return !value ? html.nothing : html`
			<img
				title=${ifDefined(tooltipText)}
				alt=${ifDefined(tooltipText)}
				${style({ verticalAlign: 'middle' })}
				src=${value}
				onload='this.hidden = false'
				onerror='this.hidden = true'
			>
		`
	}

	override getEditContentTemplate = undefined

	override *generateCsvValue(value: string, data: TData) {
		value
		yield this.getTooltipText(data) ?? ''
	}

	private getTooltipText(data: TData) {
		return !this.tooltipSelector
			? undefined
			: typeof this.tooltipSelector === 'function'
				? this.tooltipSelector(data)
				: KeyPath.get(data, this.tooltipSelector) as string | undefined
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-image': DataGridColumnImage<unknown>
	}
}