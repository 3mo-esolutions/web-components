import { component, css, property, query, unsafeCSS, type PropertyValues } from '@a11d/lit'
import { Calendar } from './Calendar.js'
import { type DateTime } from '@3mo/date-time'

@component('mo-selectable-calendar')
export class SelectableCalendar extends Calendar {
	@property({ type: Object }) value?: DateTimeRange

	@query('.month') private readonly monthElement!: HTMLElement

	protected override updated(pops: PropertyValues<this>) {
		super.updated(pops)
		this.monthElement.dataset.selection = this.dataset.selection
		this.monthElement.toggleAttribute('data-start-exists', !!this.value?.start)
		this.monthElement.toggleAttribute('data-end-exists', !!this.value?.end)
		this.monthElement.toggleAttribute('data-start-behind', this.value?.start?.isBefore(this.navigatingValue.monthEnd.weekEnd) ?? false)
		this.monthElement.toggleAttribute('data-end-ahead', this.value?.end?.isAfter(this.navigatingValue.monthEnd.weekEnd) ?? false)
	}

	static override get styles() {
		const getRangeStyles = ({ start, end }: { start: string, end: string }) => {
			return css`
				.day${unsafeCSS(start)}, .day${unsafeCSS(end)} {
					background: var(--mo-color-accent-transparent) !important;
					color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground));
				}

				.day${unsafeCSS(start)} ~ :not(${unsafeCSS(end)}):not(${unsafeCSS(end)} ~ *), /* Start is visible, end is visible or not */
				&[data-start-exists]:has(${unsafeCSS(end)}):not(:has(${unsafeCSS(start)})) .day:not(${unsafeCSS(end)}):not(${unsafeCSS(end)} ~ *), /* Start is not visible, end is visible */
				&[data-start-before][data-end-ahead] .day /* Start is before, end is after */
				{
					background: color-mix(in srgb, var(--mo-color-accent), transparent 92%);
				}
			`
		}
		return css`
			${super.styles}

			.day.selected {
				background: var(--mo-color-accent-transparent);
				color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground)) !important;
			}

			.month {
				&:not(:hover) {
					${getRangeStyles({ start: '.selected.start', end: '.selected.end' })};
				}

				&:hover {
					/* After start is selected: */
					&[data-selection=end] {
						${getRangeStyles({ start: '.selected.start', end: ':hover' })};
					}

					/* After end is selected: */
					&[data-selection=start] {
						${getRangeStyles({ start: ':hover', end: '.selected.end' })};
					}
				}
			}
		`
	}

	protected override getDayElementClasses(day: DateTime) {
		const start = this.value?.start?.dayStart.equals(day.dayStart) ?? false
		const end = this.value?.end?.dayStart.equals(day.dayStart) ?? false
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
		'mo-selectable-calendar': SelectableCalendar
	}
}