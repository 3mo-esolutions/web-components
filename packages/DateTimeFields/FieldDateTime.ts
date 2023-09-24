
import { component, html, property } from '@a11d/lit'
import { FieldDateTimeBase, FieldDateTimePrecision } from './FieldDateTimeBase.js'
import { Memoize as memoize } from 'typescript-memoize'

/** @element mo-field-date-time */
@component('mo-field-date-time')
export class FieldDateTime extends FieldDateTimeBase<Date | undefined> {
	protected get navigatingDate() { return this.value ? new DateTime(this.value) : new DateTime() }
	protected get selectedDate() { return this.value ? new DateTime(this.value) : undefined }

	@property({ type: Object }) value?: Date

	@memoize()
	protected override get placeholder() {
		return new DateTime().format(this.formatOptions)
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
		this.value = !date ? undefined : this.roundToPrecision(date)
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