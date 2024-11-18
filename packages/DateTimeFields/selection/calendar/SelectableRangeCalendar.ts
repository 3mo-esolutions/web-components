import { component, css, property } from '@a11d/lit'
import { SelectableCalendar } from './SelectableCalendar.js'
import { Temporal } from 'temporal-polyfill'

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

	protected override getDayElementClasses(month: Temporal.PlainYearMonth, day: number) {
		const start = this.dateRange?.start
		const first = month.year === start?.year && month.month === start?.month && day === start?.day

		const end = this.dateRange?.end
		const last = month.year === end?.year && month.month === end?.month && day === end?.day

		const date = month.toPlainDate({ day })
		const isInRange = (!!start || !!end)
			&& (!start || Temporal.PlainYearMonth.compare(date, start) !== -1)
			&& (!end || Temporal.PlainYearMonth.compare(date, end) !== 1)
		return {
			...super.getDayElementClasses(month, day),
			isInRange,
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