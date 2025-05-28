import { component, css, property } from '@a11d/lit'
import { type DateTime } from '@3mo/date-time'
import { Calendar } from './Calendar.js'

@component('mo-selectable-calendar')
export class SelectableCalendar extends Calendar {
	@property({ type: Object }) value?: DateTimeRange


	static override get styles() {
		return css`
			${super.styles}

			.day {
				&.start, &.end {
					background: var(--mo-color-accent-transparent);
					color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground)) !important;
				}

				&.inRange {
					background: color-mix(in srgb, var(--mo-color-accent), transparent 92%);
				}
			}
		`
	}

	protected override getDayElementClasses(day: DateTime) {
		const value = day.valueOf()
		const start = value === this.value?.start?.dayStart.valueOf()
		const end = value === this.value?.end?.dayStart.valueOf()
		const inRange = value > (this.value?.start?.dayStart.valueOf() ?? Infinity) && value < (this.value?.end?.dayStart.valueOf() ?? 0)
		return {
			...super.getDayElementClasses(day),
			start,
			end,
			inRange,
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-calendar': SelectableCalendar
	}
}