import { component, html, property, style } from '@a11d/lit'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'
import { tooltip } from '@3mo/tooltip'

/**
 * @element mo-data-grid-column-image
 *
 * @attr tooltipSelector - The data selector of the column to use as a tooltip. If a function is provided, it will be called with the data as an argument.
 */
@component('mo-data-grid-column-image')
export class DataGridColumnImage<TData> extends DataGridColumnComponent<TData, string> {
	@property() tooltipSelector?: KeyPathOf<TData> | ((data: TData) => string | undefined)

	override nonSortable = true
	override nonEditable = true

	getContentTemplate(value: string | undefined, data: TData) {
		if (!value) {
			return html.nothing
		}

		const tooltipText = !this.tooltipSelector
			? undefined
			: typeof this.tooltipSelector === 'function'
				? this.tooltipSelector(data)
				: getValueByKeyPath(data, this.tooltipSelector) as string | undefined

		return !value ? html.nothing : html`
			<img
				${tooltipText ? tooltip(tooltipText) : html.nothing}
				${style({ verticalAlign: 'middle' })}
				src=${value}
				onload='this.hidden = false'
				onerror='this.hidden = true'
			/>
		`
	}

	override getEditContentTemplate = undefined
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-image': DataGridColumnImage<unknown>
	}
}