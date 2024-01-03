
import { component, html, property } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeBase, FieldDateTimePrecision } from './FieldDateTimeBase.js'
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
export class FieldDateTime extends FieldDateTimeBase<DateTime | undefined> {
	protected get navigatingDate() { return this.value ? new DateTime(+this.value) : new DateTime() }
	protected get selectedDate() { return this.value ? new DateTime(+this.value) : undefined }

	@property() override label = t('Date & Time')
	@property({ type: Object }) value?: DateTime

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
				.value=${this.selectedDate}
				@change=${(e: CustomEvent<DateTime>) => this.handleSelectedDateChange(e.detail, FieldDateTimePrecision.Day)}
			></mo-selectable-calendar>
		`
	}

	protected override handleSelectedDateChange(date: DateTime, precision: FieldDateTimePrecision) {
		this.value = !date ? undefined : this.floorToPrecision(date)
		super.handleSelectedDateChange(date, precision)
	}

	protected valueToInputValue(value: DateTime | undefined) {
		return value ? value.format(this.formatOptions) ?? '' : ''
	}

	protected inputValueToValue(value: string) {
		return value ? DateTime.parse(value, this.shortcutReferenceDate) : undefined
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-time': FieldDateTime
	}
}