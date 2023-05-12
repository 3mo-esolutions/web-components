import { Component, css, component, html, state, nothing, property, query, classMap, style } from '@a11d/lit'
import type { Flex } from '@3mo/flex'
import '@a11d/array.prototype.group'

@component('mo-calendar')
export class Calendar extends Component {
	private static readonly startingYearDate = new DateTime(1900, 6, 1)

	@property({ type: Boolean, reflect: true }) includeWeekNumbers = false

	@state() protected navigatingDate = new DateTime()
	@state() private yearSelection = false

	@query('.year.selected') private readonly selectedYearElement!: Flex

	private readonly today = new DateTime().round({ smallestUnit: 'day', roundingMode: 'floor' })
	private readonly years = new Array(200).fill(undefined).map((_n, i) => Calendar.startingYearDate.addYears(i))

	static override get styles() {
		return css`
			:host {
				--mo-calendar-max-width: 325px;
				--mo-calendar-min-height: 230px;
				--mo-calendar-day-size: 36px;
				--mo-calendar-week-number-width: var(--mo-calendar-day-size);
			}

			.monthHeader, .week {
				color: var(--mo-color-gray);
			}

			.monthHeader {
				align-items: center;
			}

			.navigatingMonth, .navigatingYear {
				font-size: large;
				transition: 250ms;
			}

			.navigatingYear:hover {
				color: var(--mo-color-accent);
				cursor: pointer;
			}

			.day, .year {
				text-align: center;
				border-radius: 100px;
				cursor: pointer;
				transition: 250ms;
				font-weight: 500;
				user-select: none;
				font-size: medium;
				width: var(--mo-calendar-day-size);
				-webkit-user-select: none;
				align-items: center;
				justify-content: center;
			}

			.year {
				width: 100%;
				justify-content: center;
				align-items: center;
			}

			.selected {
				background: var(--mo-color-accent);
				color: var(--mo-color-accessible) !important;
			}

			.day {
				height: var(--mo-calendar-day-size);
			}

			.day:hover, .year:hover {
				background: var(--mo-color-transparent-gray-3);
			}

			.day:not(.isInMonth) {
				color: var(--mo-color-gray);
			}

			.day.today {
				color: var(--mo-color-accent);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex alignItems='center' justifyContent='center' ${style({ width: 'var(--mo-calendar-max-width)', minHeight: 'var(--mo-calendar-min-height)' })}>
				<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' ${style({ width: '100%' })}>
					<mo-icon-button icon=${getComputedStyle(this).direction === 'rtl' ? 'keyboard_arrow_right' : 'keyboard_arrow_left'}
						@click=${() => this.navigatingDate = this.navigatingDate.addMonths(-1)}
					></mo-icon-button>
					<div>
						<a class='navigatingMonth'>${this.navigatingDate.monthName}</a>
						<a class='navigatingYear' @click=${() => this.toggleYearSelection()}>${this.navigatingDate.yearName}</a>
					</div>
					<mo-icon-button icon=${getComputedStyle(this).direction === 'rtl' ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}
						@click=${() => this.navigatingDate = this.navigatingDate.addMonths(+1)}
					></mo-icon-button>
				</mo-flex>

				${this.yearSelection ? this.yearSelectionTemplate : this.daySelectionTemplate}
			</mo-flex>
		`
	}

	private get daySelectionTemplate() {
		const start = this.navigatingDate.monthStart?.weekStart as DateTime
		const end = this.navigatingDate.monthEnd?.weekEnd as DateTime
		const range = this.rangeOf(start, end)
		const weekDaysInMonth = [...range.groupToMap(d => String(d.weekOfYear))]
			.sort(([, dates1], [, dates2]) => dates1[0]?.isBefore(dates2[0]!) ? -1 : +1)
		return html`
			<mo-grid class='month'
				rows='repeat(auto-fill, var(--mo-calendar-day-size))'
				columns=${this.includeWeekNumbers ? 'var(--mo-calendar-week-number-width) repeat(7, var(--mo-calendar-day-size))' : 'repeat(7, var(--mo-calendar-day-size))'}
				${style({ alignItems: 'center', justifyItems: 'center' })}
			>
				${this.includeWeekNumbers === false ? nothing : html`<div></div>`}

				${DateTime.getWeekDayNames().map(dayName => html`
					<div class='monthHeader'>
						${dayName.charAt(0).toUpperCase() + dayName.charAt(1)}
					</div>
				`)}

				${weekDaysInMonth.map(([weekNumber, days]) => html`
					${this.includeWeekNumbers === false ? nothing : html`
						<div class='week'>
							${weekNumber}
						</div>
					`}

					${days.map(day => this.getDayTemplate(day))}
				`)}
			</mo-grid>
		`
	}

	protected getDayTemplate(day: DateTime) {
		return html`
			<mo-flex class=${classMap(this.getDefaultDayElementClasses(day))}>${day.format({ day: 'numeric' })}</mo-flex>
		`
	}

	protected getDefaultDayElementClasses(day: DateTime) {
		const monthRange = this.rangeOf(day.monthStart!, day.monthEnd!)
		const daysOfMonth = [...monthRange.groupToMap(day => String(day.month))]
			.sort(([, days1], [, days2]) => days1.length > days2.length ? -1 : +1)[0]?.[1]
		return {
			day: true,
			today: day.equals(this.today),
			isInMonth: day.localMonth === daysOfMonth?.[0]?.localMonth,
		}
	}

	private get yearSelectionTemplate() {
		return html`
			<mo-scroller ${style({ height: '*' })}>
				<mo-grid rows='repeat(50, var(--mo-calendar-day-size))' columns='repeat(4, 1fr)'>
					${this.years.map(year => html`
						<mo-flex class=${classMap({ year: true, selected: this.navigatingDate.year === year.year })} @click=${() => this.selectYear(year.year)}>
							${year.yearName}
						</mo-flex>
					`)}
				</mo-grid>
			</mo-scroller>
		`
	}

	private selectYear(year: number) {
		this.navigatingDate.setFullYear(year)
		this.yearSelection = false
	}

	private toggleYearSelection() {
		this.yearSelection = !this.yearSelection
		if (this.yearSelection) {
			new Promise(() => setTimeout(() => {
				this.selectedYearElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'center'
				})
			}, 1))
		}
	}

	private rangeOf(start: DateTime, end: DateTime) {
		return new Array(Math.abs(Math.round(end.until(start).days)) + 1)
			.fill(undefined)
			.map((_, i) => start.addDays(i))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}