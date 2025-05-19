
import { component } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldDateTime } from './FieldDateTime.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

Localizer.dictionaries.add('de', {
	'Date': 'Datum',
})

/**
 * @element mo-field-date
 *
 * @i18n "Date"
 */
@component('mo-field-date')
export class FieldDate extends FieldDateTime {
	override precision = FieldDateTimePrecision.Day
	override label = t('Date')
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date': FieldDateTime
	}
}