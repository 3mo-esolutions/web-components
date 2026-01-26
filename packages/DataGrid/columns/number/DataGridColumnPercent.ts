import { component, html, ifDefined } from '@a11d/lit'
import { DataGridColumnNumberBase } from './DataGridColumnNumberBase.js'

/** @element mo-data-grid-column-percent */
@component('mo-data-grid-column-percent')
export class DataGridColumnPercent<TData> extends DataGridColumnNumberBase<TData> {
	override getContentTemplate(value: number | undefined, data: TData) {
		data
		return html`${this.getNumber(value)?.formatAsPercent(this.formatOptions) ?? html.nothing}`
	}

	override getEditContentTemplate(value: number | undefined, data: TData) {
		return html`
			<mo-field-percent dense autofocus selectOnFocus
				min=${ifDefined(this.getMin(data))}
				max=${ifDefined(this.getMax(data))}
				step=${ifDefined(this.getStep(data))}
				value=${ifDefined(value)}
				@change=${(e: CustomEvent<number>) => this.handleEdit(e.detail, data)}
			></mo-field-percent>
		`
	}

	getSumTemplate(sum: number) {
		return html`${sum.formatAsPercent(this.formatOptions)}`
	}

	override *generateCsvHeading() {
		yield* [...super.generateCsvHeading()].map(heading => `${heading} (%)`)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-percent': DataGridColumnPercent<unknown>
	}
}