import { component } from '@a11d/lit'
import { FieldDateTime } from './FieldDateTime.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'

/**
 * A date field, typed into segments in the language's order or picked from a calendar, at the precision of a day, a week, a month or a year.
 *
 * @element mo-field-date
 *
 * @accessibility
 * The segments follow the [segmented input](?path=/docs/behaviors-segmented-input--overview): a `group` named after the `label`, with one `spinbutton` per part, and one tab stop for the group. `aria-invalid`, `aria-required` and `aria-readonly` follow the field.
 * `Alt` `ArrowDown` opens the picker. The picker's calendar cannot be operated with the keyboard yet, so the segments are the keyboard's way in.
 */
@component('mo-field-date')
export class FieldDate extends FieldDateTime {
	override precision = FieldDateTimePrecision.Day
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date': FieldDateTime
	}
}
