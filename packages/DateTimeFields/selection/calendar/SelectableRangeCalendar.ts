import { component, css, property } from '@a11d/lit'
import { type DateTime } from '@3mo/date-time'
import { SelectableCalendar } from './SelectableCalendar.js'

/** @fires change */
@component('mo-selectable-range-calendar')
export class SelectableRangeCalendar extends SelectableCalendar {
	@property({ type: Object }) dateRange?: DateTimeRange

	static override get styles() {
		return css`
			${super.styles}

			.day {
				&.isInRange {
					border-radius: 0px;
					&:not(.selected) {
						background: color-mix(in srgb, var(--mo-color-accent), transparent 92%);
					}
				}

				&.selected {
					&.first {
						border-radius: 100px;
						border-start-start-radius: 100px;
						border-start-end-radius: 0;
						border-end-start-radius: 100px;
						border-end-end-radius: 0;
					}

					&.last {
						border-radius: 100px;
						border-start-start-radius: 0;
						border-start-end-radius: 100px;
						border-end-start-radius: 0;
						border-end-end-radius: 100px;
					}
				}
			}
		`
	}

	protected override getDayElementClasses(day: DateTime) {
		const first = this.dateRange?.start?.dayStart.equals(day.dayStart) ?? false
		const last = this.dateRange?.end?.dayStart.equals(day.dayStart) ?? false
		return {
			...super.getDayElementClasses(day),
			isInRange: this.dateRange?.includes(day) ?? false,
			first,
			last,
			selected: first || last,
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-range-calendar': SelectableRangeCalendar
	}
}