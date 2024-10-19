import { Component, css, component, html, property, classMap, type ClassInfo, state, style, type HTMLTemplateResult } from '@a11d/lit'
import '@a11d/array.prototype.group'
import { MemoizeExpiring as memoizeExpiring } from 'typescript-memoize'
import { Temporal } from 'temporal-polyfill'

type CalendarMonth = {
	readonly month: Temporal.PlainYearMonth
	readonly days: DateTime[]
}

@component('mo-calendar')
export class Calendar extends Component {
	private static * rangeOf(start: DateTime, end: DateTime) {
		start = start.dayStart
		while (!start.isAfter(end)) {
			yield start
			start = start.add({ days: 1 })
		}
	}

	private group(dates: DateTime[]): CalendarMonth[] {
		return dates.reduce((array, item) => {
			const month = Temporal.PlainYearMonth.from(item)
			const last = array[array.length - 1]
			if (last && last.month.equals(month)) {
				last.days.push(item)
			} else {
				array.push({ month, days: [item] })
			}
			return array
		}, [] as CalendarMonth[])
	}

	@property({ type: Boolean, reflect: true }) includeWeekNumbers = false
	@property({
		type: Object,
		updated(this: Calendar) {
			const start = this.navigatingValue.subtract({ months: 3 }).monthStart
			const end = this.navigatingValue.add({ months: 3 }).monthEnd
			this.months = this.group([...Calendar.rangeOf(start, end)])
		}
	}) navigatingValue = new DateTime

	@state() private months: CalendarMonth[] = []

	static override get styles() {
		return css`
			:host {
				--mo-calendar-day-size: 36px;
				--mo-calendar-week-number-width: var(--mo-calendar-day-size);
				padding-inline: 10px;
			}

			mo-scroller {
				height: 288px;

				&::part(container) {
					position: relative;
					display: grid;
					grid-template-columns: repeat(7, var(--mo-calendar-day-size));
				}
			}

			:host([includeWeekNumbers]) mo-scroller::part(container) {
				grid-template-columns: var(--mo-calendar-week-number-width) repeat(7, var(--mo-calendar-day-size));
			}

			.month {
				display: grid;
				grid-column: 1 / -1;
				grid-template-columns: subgrid;
				grid-template-rows: auto repeat(auto-fill, var(--mo-calendar-day-size));
				place-items: center;
				scroll-snap-align: start;
				scroll-snap-stop: always;

				.heading {
					font-weight: 500;
					font-size: 16px;
					grid-column: 1 / -1;
					place-self: stretch;
					display: flex;
					align-items: center;
					padding-inline-start: 6px;
					padding-block-start: 18px;
					padding-block-end: 12px;
				}

				.header {
					color: var(--mo-color-gray);
				}
			}

			.week {
				color: var(--mo-color-gray);
			}

			.day {
				text-align: center;
				border-radius: 100px;
				cursor: pointer;
				transition: 100ms;
				font-weight: 500;
				user-select: none;
				font-size: medium;
				width: var(--mo-calendar-day-size);
				-webkit-user-select: none;
				align-items: center;
				justify-content: center;
				height: var(--mo-calendar-day-size);

				&:hover {
					background: var(--mo-color-transparent-gray-3);
				}

				&.today {
					outline: 2px dashed var(--mo-color-gray-transparent);
				}

				&.navigation {
					background: var(--mo-color-transparent-gray-3);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<mo-scroller snapType='y mandatory'>
				${this.months.map(month => this.getMonthTemplate(month))}
			</mo-scroller>
		`
	}

	private getMonthTemplate(month: CalendarMonth) {
		return html`
			<div class='month'>
				<div class='heading' style='grid-column: 1 / -1'>
					${month.days[0]?.format({ year: 'numeric' })}
					${month.days[0]?.format({ month: 'long' })}
				</div>

				${this.includeWeekNumbers === false ? html.nothing : html`<div></div>`}

				${this.navigatingValue.weekDayNames.map(dayName => html`
					<div class='header'>
						${dayName.charAt(0).toUpperCase() + dayName.charAt(1)}
					</div>
				`)}

				${month.days.map(day => this.getDayTemplate(day))}
			</div>
		`
	}

	protected getDayTemplate(day: DateTime) {
		return html`
			${!this.includeWeekNumbers || day.dayOfWeek !== 1 ? html.nothing : html`
				<div class='week'>${day.weekOfYear}</div>
			`}
			<mo-flex tabindex='0'
				class=${classMap(this.getDayElementClasses(day))}
				@click=${() => this.handleDayClick(day)}
				${style({ gridColumn: day.dayOfWeek })}
			>
				${day.format({ day: 'numeric' })}
			</mo-flex>
		`
	}

	protected handleDayClick(day: DateTime) {
		day
	}

	@memoizeExpiring(60_000)
	private get now() { return new DateTime }

	protected getDayElementClasses(day: DateTime): ClassInfo {
		return {
			day: true,
			today: this.now.year === day.year && this.now.month === day.month && this.now.day === day.day,
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}