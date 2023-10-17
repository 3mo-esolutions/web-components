import { property, literal, html, staticHtml } from '@a11d/lit'
import { DataGridColumn } from '../DataGridColumn.js'

/**
 * @attr formatOptions - Options to pass to Date.prototype.format()
 * @attr pickerHidden - Hides the date/time picker
 */
export abstract class DataGridColumnDateTimeBase<TData, TDate extends { format(options: unknown): string }> extends DataGridColumn<TData, TDate> {
	abstract readonly fieldTag: ReturnType<typeof literal>

	@property({ type: Object }) formatOptions?: Parameters<TDate['format']>[0]
	@property({ type: Boolean }) pickerHidden = false

	getEditContentTemplate(value: TDate | undefined, data: TData) {
		return html`
			${staticHtml`
				<${this.fieldTag} dense data-focus
					?pickerHidden=${this.pickerHidden}
					label=${this.heading}
					.value=${value}
					@change=${(e: CustomEvent<TDate>) => this.handleEdit(e.detail, data)}
				></${this.fieldTag}>
			`}
		`
	}
}