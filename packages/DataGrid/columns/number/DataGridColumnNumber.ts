import { component, html, ifDefined, property, style } from '@a11d/lit'
import { hasChanged } from '@a11d/equals'
import { DataGridColumnNumberBase } from './DataGridColumnNumberBase.js'

/** @element mo-data-grid-column-number */
@component('mo-data-grid-column-number')
export class DataGridColumnNumber<TData> extends DataGridColumnNumberBase<TData> {
	@property({ type: Object, hasChanged }) formatOptions?: Intl.NumberFormatOptions

	override getContentTemplate(value: number | undefined, data: TData) {
		data
		return html`${this.getNumber(value)?.format(this.formatOptions) ?? html.nothing}`
	}

	override getEditContentTemplate(value: number | undefined, data: TData) {
		return html`
			<mo-field-number dense autofocus selectOnFocus
				min=${ifDefined(this.getMin(data))}
				max=${ifDefined(this.getMax(data))}
				step=${ifDefined(this.getStep(data))}
				value=${ifDefined(value)}
				@change=${(e: CustomEvent<number>) => this.handleEdit(e.detail, data)}
			></mo-field-number>
		`
	}

	getSumTemplate(sum: number) {
		return html`<div ${style({ textAlign: 'center', fontWeight: '500' })}>${sum.format(this.formatOptions)}</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-number': DataGridColumnNumber<unknown>
	}
}