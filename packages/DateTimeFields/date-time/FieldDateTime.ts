import { component, property } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeBase } from './FieldDateTimeBase.js'
import { FieldDateTimeController } from './FieldDateTimeController.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'

Localizer.dictionaries.add('de', {
	'Date & Time': 'Datum & Uhrzeit',
	'Date': 'Datum',
	'Year': 'Jahr',
	'Month': 'Monat',
})

/**
 * Its behaviour is {@link FieldDateTimeController}, for a date field of another design.
 *
 * @element mo-field-date-time
 *
 * @i18n "Date & Time"
 * @i18n "Date"
 * @i18n "Year"
 * @i18n "Month"
 * @i18n "Week"
 * @i18n "Today"
 * @i18n "Yesterday"
 * @i18n "Tomorrow"
 * @i18n "Week start"
 * @i18n "Week end"
 * @i18n "Month start"
 * @i18n "Month end"
 * @i18n "Year start"
 * @i18n "Year end"
 * @i18n "Empty"
 */
@component('mo-field-date-time')
export class FieldDateTime extends FieldDateTimeBase<Date | undefined> {
	@property({ type: Object }) value?: Date

	readonly controller = new FieldDateTimeController(this, this.controllerOptions)

	protected override get _label() {
		return super._label || this.defaultLabel
	}

	private get defaultLabel() {
		switch (this.precision) {
			case FieldDateTimePrecision.Year: return t('Year')
			case FieldDateTimePrecision.Month: return t('Month')
			case FieldDateTimePrecision.Week: return t('Week')
			case FieldDateTimePrecision.Day: return t('Date')
			default: return t('Date & Time')
		}
	}

	protected get segmentsTemplate() {
		return this.getSegmentsTemplate(this.controller.segments)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-time': FieldDateTime
	}
}