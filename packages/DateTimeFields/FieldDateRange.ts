
import { component, property } from '@a11d/lit'
import { FieldDateTimePrecision } from './FieldDateTimeBase.js'
import { FieldDateTimeRange } from './FieldDateTimeRange.js'

/** @element mo-field-date */
@component('mo-field-date-range')
export class FieldDateRange extends FieldDateTimeRange {
	@property() override precision = FieldDateTimePrecision.Day
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-range': FieldDateRange
	}
}