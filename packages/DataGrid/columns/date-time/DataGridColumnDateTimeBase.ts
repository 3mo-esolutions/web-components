import { property, literal, html, staticHtml } from '@a11d/lit'
import { DataGridColumn } from '../DataGridColumn.js'

/**
 * @attr formatOptions - Options to pass to Date.prototype.format()
 * @attr pickerHidden - Hides the date/time picker
 */
export abstract class DataGridColumnDateTimeBase<TData, TDate extends { format(...options: any[]): string }> extends DataGridColumn<TData, TDate> {
	static defaultFormatOptions?: Intl.DateTimeFormatOptions
	abstract readonly fieldTag: ReturnType<typeof literal>

	@property({ type: Object }) formatOptions?: Intl.DateTimeFormatOptions
	@property({ type: Boolean }) pickerHidden = false

	protected get formatOptionsValue() {
		return this.formatOptions ?? (this.constructor as typeof DataGridColumnDateTimeBase).defaultFormatOptions
	}

	getEditContentTemplate(value: TDate | undefined, data: TData) {
		return html`
			${staticHtml`
				<${this.fieldTag} dense autofocus
					?pickerHidden=${this.pickerHidden}
					label=${this.heading}
					.value=${value}
					@change=${(e: CustomEvent<TDate>) => this.handleEdit(e.detail, data)}
				></${this.fieldTag}>
			`}
		`
	}
}