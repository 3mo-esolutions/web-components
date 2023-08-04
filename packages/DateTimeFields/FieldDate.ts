
import { component, property } from '@a11d/lit'
import { FieldDateTime } from './FieldDateTime.js'
import { FieldDateTimePrecision } from './FieldDateTimeBase.js'

/** @element mo-field-date */
@component('mo-field-date')
export class FieldDate extends FieldDateTime {
	@property() override precision = FieldDateTimePrecision.Day
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date': FieldDateTime
	}
}