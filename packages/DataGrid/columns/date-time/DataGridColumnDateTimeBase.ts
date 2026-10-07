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

	/** An ISO 8601 date and time in local time, unlike `toISOString()`, which shifts it to UTC. */
	protected static toLocalIsoString(value: Date) {
		const pad = (number: number) => String(number).padStart(2, '0')
		return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
	}

	protected getFormatOptions(defaultPrecision: FieldDateTimePrecision) {
		return this.formatOptions || (this.precision === defaultPrecision ? undefined : this.precision.formatOptions)
	}

	override getEditContentTemplate(value: TDate | undefined, data: TData) {
		return html`
			${staticHtml`
				<${this.fieldTag} dense autofocus selectOnFocus style='width: fit-content; min-width: 100%;'
					label=' '
					.precision=${this.precision}
					?pickerHidden=${this.pickerHidden}
					.value=${value}
					@change=${(e: CustomEvent<TDate>) => this.handleEdit(e.detail, data)}
				></${this.fieldTag}>
			`}
		`
	}
}
