import { property, html, staticHtml, type StaticValue } from '@a11d/lit'
import { hasChanged } from '@a11d/equals'
import { FieldDateTimePrecision } from '@3mo/date-time-fields'
import { DataGridColumnComponent } from '../DataGridColumnComponent.js'

/**
 * @attr formatOptions - Options to pass to DateTime.prototype.format()
 * @attr precision - The precision of the date/time.
 * @attr pickerHidden - Hides the date/time picker
 */
export abstract class DataGridColumnDateTimeBase<TData, TDate extends { format(...options: any[]): string }> extends DataGridColumnComponent<TData, TDate> {
	abstract readonly fieldTag: StaticValue

	@property({ type: Object, hasChanged }) formatOptions?: Intl.DateTimeFormatOptions
	@property({ type: String, converter: value => FieldDateTimePrecision.parse(value || undefined) }) precision = FieldDateTimePrecision.Minute
	@property({ type: Boolean }) pickerHidden = false

	protected getFormatOptions(defaultPrecision: FieldDateTimePrecision) {
		return this.formatOptions || (this.precision === defaultPrecision ? undefined : this.precision.formatOptions)
	}

	override getEditContentTemplate(value: TDate | undefined, data: TData) {
		return html`
			${staticHtml`
				<${this.fieldTag} dense autofocus selectOnFocus
					.precision=${this.precision}
					?pickerHidden=${this.pickerHidden}
					.value=${value}
					@change=${(e: CustomEvent<TDate>) => this.handleEdit(e.detail, data)}
				></${this.fieldTag}>
			`}
		`
	}
}