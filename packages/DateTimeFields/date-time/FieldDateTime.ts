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
 * A date and time field, typed into segments in the language's order or picked from a calendar and time lists.
 *
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
 *
 * @accessibility
 * The segments follow the [segmented input](?path=/docs/behaviors-segmented-input--overview): a `group` named after the `label`, with one `spinbutton` per part, and one tab stop for the group. `aria-invalid`, `aria-required` and `aria-readonly` follow the field.
 * `Alt` `ArrowDown` opens the picker. The picker's calendar cannot be operated with the keyboard yet, so the segments are the keyboard's way in.
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