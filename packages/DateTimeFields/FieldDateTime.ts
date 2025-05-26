
import { component, html, property } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeBase } from './FieldDateTimeBase.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import { Memoize as memoize } from 'typescript-memoize'

Localizer.dictionaries.add('de', {
	'Date & Time': 'Datum & Uhrzeit',
})

/**
 * @element mo-field-date-time
 *
 * @i18n "Date & Time"
 */
@component('mo-field-date-time')
export class FieldDateTime extends FieldDateTimeBase<Date | undefined> {
	protected get selectedDate() {
		if (!this.value) {
			return undefined
		}
		if (this.value instanceof Date) {
			return new DateTime(this.value)
		}
		return this.value
	}

	@property() override label = t('Date & Time')
	@property({ type: Object }) value?: Date

	@memoize()
	protected override get placeholder() {
		return new DateTime().format(this.formatOptions)
	}

	protected resetNavigatingDate() {
		this.navigatingDate = this.selectedDate ?? new DateTime()
	}

	protected get calendarTemplate() {
		return html`
			<mo-selectable-calendar
				.navigatingValue=${this.navigatingDate}
				.value=${new DateTimeRange(this.selectedDate, this.selectedDate)}
				@dayClick=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Day)}
			></mo-selectable-calendar>
		`
	}

	protected override handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		this.value = !date ? undefined : this.precision.getRange(date).start
		super.handleSelectedDateChange(date, precision)
	}

	protected valueToInputValue(value: Date | undefined) {
		return value ? value.format(this.formatOptions) ?? '' : ''
	}

	protected inputValueToValue(value: string) {
		return value ? DateTime.parseAsDateTime(value, this.shortcutReferenceDate) : undefined
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-time': FieldDateTime
	}
}