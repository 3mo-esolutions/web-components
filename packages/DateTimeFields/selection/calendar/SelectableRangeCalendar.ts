import { component, css, property } from '@a11d/lit'
import { DateTime } from '@3mo/date-time'
import { SelectableCalendar } from './SelectableCalendar.js'

/** @fires change {CustomEvent<T>} */
@component('mo-selectable-range-calendar')
export class SelectableRangeCalendar extends SelectableCalendar {
	@property({ type: Object }) dateRange?: DateTimeRange

	static override get styles() {
		return css`
			${super.styles}

			.day.isInRange:not(.selected) {
				background: rgba(var(--mo-color-accent-base), 0.08);
			}

			.day.isInRange {
				border-radius: 0px;
			}

			.day.selected.first {
				border-radius: 100px 0 0 100px;
			}

			.day.selected.last {
				border-radius: 0 100px 100px 0;
			}

			.day.selected.first.last {
				border-radius: 100px;
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