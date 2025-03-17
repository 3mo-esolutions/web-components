import { component, css, event, property } from '@a11d/lit'
import { Calendar } from './Calendar.js'
import { type DateTime } from '@3mo/date-time'

/** @fires change */
@component('mo-selectable-calendar')
export class SelectableCalendar extends Calendar {
	@event() readonly change!: EventDispatcher<DateTime>

	@property({ type: Object }) value?: DateTime

	static override get styles() {
		return css`
			${super.styles}
			${this.calendarStyles}
		`
	}

	protected static get calendarStyles() {
		return css`
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

	protected override getDayElementClasses(day: DateTime) {
		return {
			...super.getDayElementClasses(day),
			selected: !!this.value && day.equals(this.value),
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-calendar': SelectableCalendar
	}
}