
import { html, classMap, ClassInfo, component, property } from '@a11d/lit'
import { DateParser } from './DateParser.js'
import { CalendarSelectionAdapter } from './calendar/index.js'
import { FieldDateBase } from './FieldDateBase.js'

class DateCalendarSelectionAdapter extends CalendarSelectionAdapter<DateTime> {
	getDayTemplate(day: DateTime, classInfo: ClassInfo) {
		return html`
			<mo-flex
				class=${classMap({ ...classInfo, selected: this.calendar.value?.equals(day) ?? false })}
				@click=${() => this.select(day)}
			>${day.format({ day: 'numeric' })}</mo-flex>
		`
	}

	getNavigatingDate(value?: DateTime) {
		const date = value ?? new DateTime()
		return new DateTime(date.year, date.month)
	}
}

/** @element mo-field-date */
@component('mo-field-date')
export class FieldDate extends FieldDateBase<Date | undefined> {
	protected calendarSelectionAdapterConstructor = DateCalendarSelectionAdapter

	@property({ type: Object }) value?: Date

	protected override handleCalendarChange(value?: Date) {
		super.handleCalendarChange(value)
		this.open = false
	}

	protected valueToInputValue(value: Date | undefined) {
		return value ? value.formatAsDate() ?? '' : ''
	}

	protected inputValueToValue(value: string) {
		return value ? DateParser.parse(value, this.shortcutReferenceDate) : undefined
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date': FieldDate
	}
}