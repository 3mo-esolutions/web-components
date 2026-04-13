
import { component } from '@a11d/lit'
import { FieldDateTime } from './FieldDateTime.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

/**
 * @element mo-field-date
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