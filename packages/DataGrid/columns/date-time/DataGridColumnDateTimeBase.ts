import { property, html, staticHtml, type StaticValue } from '@a11d/lit'
import { DataGridColumnComponent } from '../DataGridColumnComponent.js'

/**
 * @attr formatOptions - Options to pass to Date.prototype.format()
 * @attr pickerHidden - Hides the date/time picker
 */
export abstract class DataGridColumnDateTimeBase<TData, TDate extends { format(...options: any[]): string }> extends DataGridColumnComponent<TData, TDate> {
	static defaultFormatOptions?: Intl.DateTimeFormatOptions
	abstract readonly fieldTag: StaticValue

	@property({ type: Object }) formatOptions?: Intl.DateTimeFormatOptions
	@property({ type: Boolean }) pickerHidden = false

	protected get formatOptionsValue() {
		return this.formatOptions ?? (this.constructor as typeof DataGridColumnDateTimeBase).defaultFormatOptions
	}

	override getEditContentTemplate(value: TDate | undefined, data: TData) {
		return html`
			${staticHtml`
				<${this.fieldTag} dense autofocus selectOnFocus
					?pickerHidden=${this.pickerHidden}
					.value=${value}
					@change=${(e: CustomEvent<TDate>) => this.handleEdit(e.detail, data)}
				></${this.fieldTag}>
			`}
		`
	}
}