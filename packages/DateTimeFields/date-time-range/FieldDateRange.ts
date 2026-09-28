
import { component } from '@a11d/lit'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { FieldDateTimeRange } from './FieldDateTimeRange.js'

/**
 * A date range field, with segments for each end and a calendar that picks the start and then the end.
 *
 * @element mo-field-date-range
 *
 * @ssr true
 *
 * @accessibility
 * The segments follow the [segmented input](?path=/docs/behaviors-segmented-input--overview): a `group` named after the `label`, with one `spinbutton` per part, and one tab stop for the group. `aria-invalid`, `aria-required` and `aria-readonly` follow the field.
 * `Alt` `ArrowDown` opens the picker. The picker's calendar cannot be operated with the keyboard yet, so the segments are the keyboard's way in.
 */
@component('mo-field-date-range')
export class FieldDateRange extends FieldDateTimeRange {
	override precision = FieldDateTimePrecision.Day
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-range': FieldDateRange
	}
}