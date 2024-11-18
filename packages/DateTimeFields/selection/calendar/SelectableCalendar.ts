import { component, css, event, property } from '@a11d/lit'
import { Temporal } from 'temporal-polyfill'
import { type DateTime } from '@3mo/date-time'
import { Calendar } from './Calendar.js'

/** @fires change */
@component('mo-selectable-calendar')
export class SelectableCalendar extends Calendar {
	@event() readonly change!: EventDispatcher<DateTime>

	@property({ type: Object }) value?: DateTime

	static override get styles() {
		return css`
			${super.styles}

			.day.selected {
				background: var(--mo-color-accent-transparent);
				color: var(--mo-color-accent) !important;
			}
		`
	}

	protected override handleDayClick(day: DateTime) {
		this.value = day
		this.change.dispatch(day)
	}

	protected override getDayElementClasses(month: Temporal.PlainYearMonth, day: number) {
		return {
			...super.getDayElementClasses(month, day),
			selected: !!this.value && month.year === this.value.year && month.month === this.value.month && day === this.value.day
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-calendar': SelectableCalendar
	}
}