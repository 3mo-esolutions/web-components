import { component, css, property, query, unsafeCSS, type PropertyValues } from '@a11d/lit'
import { type DateTime } from '@3mo/date-time'
import { SelectableCalendar } from './SelectableCalendar.js'

/** @fires change */
@component('mo-selectable-range-calendar')
export class SelectableRangeCalendar extends SelectableCalendar {
	@property({ type: Object }) dateRange?: DateTimeRange

	@query('.month') private readonly monthElement!: HTMLElement

	protected override updated(pops: PropertyValues<this>) {
		super.updated(pops)
		this.monthElement.dataset.selection = this.dataset.selection
		this.monthElement.toggleAttribute('data-start-exists', !!this.dateRange?.start)
		this.monthElement.toggleAttribute('data-end-exists', !!this.dateRange?.end)
		this.monthElement.toggleAttribute('data-start-behind', this.dateRange?.start?.isBefore(this.navigatingValue.monthEnd.weekEnd) ?? false)
		this.monthElement.toggleAttribute('data-end-ahead', this.dateRange?.end?.isAfter(this.navigatingValue.monthEnd.weekEnd) ?? false)
	}

	protected static override get calendarStyles() {
		return css`
			.month {
				&:not(:hover) {
					${this.getRangeStyles({ start: '.selected.start', end: '.selected.end' })}
				}

				&:hover {
					/* After start is selected: */
					&[data-selection=end] {
						${this.getRangeStyles({ start: '.selected.start', end: ':hover' })}
					}

					/* After end is selected: */
					&[data-selection=start] {
						${this.getRangeStyles({ start: ':hover', end: '.selected.end' })}
					}
				}
			}
		`
	}

	private static getRangeStyles({ start, end }: { start: string, end: string }) {
		return css`
			.day${unsafeCSS(start)}, .day${unsafeCSS(end)} {
				background: var(--mo-color-accent-transparent) !important;
				color: var(--mo-color-accent);
			}

			.day${unsafeCSS(start)} ~ :not(${unsafeCSS(end)}):not(${unsafeCSS(end)} ~ *), /* Start is visible, end is visible or not */
			&[data-start-exists]:has(${unsafeCSS(end)}):not(:has(${unsafeCSS(start)})) .day:not(${unsafeCSS(end)}):not(${unsafeCSS(end)} ~ *), /* Start is not visible, end is visible */
			&[data-start-before][data-end-ahead] .day /* Start is before, end is after */
			{
				background: color-mix(in srgb, var(--mo-color-accent), transparent 92%);
			}
		`
	}

	protected override getDayElementClasses(day: DateTime) {
		const start = this.dateRange?.start?.dayStart.equals(day.dayStart) ?? false
		const end = this.dateRange?.end?.dayStart.equals(day.dayStart) ?? false
		return {
			...super.getDayElementClasses(day),
			start,
			end,
			selected: start || end,
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-range-calendar': SelectableRangeCalendar
	}
}