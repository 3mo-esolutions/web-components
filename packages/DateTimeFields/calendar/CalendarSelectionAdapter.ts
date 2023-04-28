import { ClassInfo, css, HTMLTemplateResult } from '@a11d/lit'
import { SelectableCalendar } from './SelectableCalendar.js'

export abstract class CalendarSelectionAdapter<T> {
	constructor(protected readonly calendar: SelectableCalendar<T>) { }

	get styles() { return css`` }

	abstract getDayTemplate(day: DateTime, classInfo: ClassInfo): HTMLTemplateResult

	abstract getNavigatingDate(value: T | undefined): DateTime

	protected select(value: T) {
		this.calendar.value = value
		this.calendar.change.dispatch(value)
	}
}