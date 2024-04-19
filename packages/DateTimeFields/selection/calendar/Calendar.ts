import { Component, css, component, html, property, classMap, style, ClassInfo, state } from '@a11d/lit'
import '@a11d/array.prototype.group'
import { MemoizeExpiring as memoizeExpiring } from 'typescript-memoize'

@component('mo-calendar')
export class Calendar extends Component {
	@property({ type: Boolean, reflect: true }) includeWeekNumbers = false
	@property({
		type: Object,
		updated(this: Calendar) {
			const start = this.navigatingValue.monthStart.weekStart
			const end = this.navigatingValue.monthEnd.weekEnd
			const range = [...this.rangeOf(start, end)]
			this.days = [...range.groupToMap(d => String(d.weekOfYear))]
				.sort(([, dates1], [, dates2]) => dates1[0]?.isBefore(dates2[0]!) ? -1 : +1)
		}
	}) navigatingValue = new DateTime

	@state() private days = new Array<[weekNumber: string, days: Array<DateTime>]>()

	static override get styles() {
		return css`
			:host {
				--mo-calendar-day-size: 36px;
				--mo-calendar-week-number-width: var(--mo-calendar-day-size);
				padding-inline: 10px;
			}

			mo-selectable-list {
				display: grid !important;
				grid-template-rows: repeat(auto-fill, var(--mo-calendar-day-size));
				grid-template-columns: repeat(7, var(--mo-calendar-day-size));
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
			}

			.day {
				height: var(--mo-calendar-day-size);
			}

			.dayName, .weekNumber {
				color: var(--mo-color-gray);
			}

			.day:hover {
				background: var(--mo-color-transparent-gray-3);
			}

			.day:not(.isInMonth) {
				color: var(--mo-color-gray);
			}

			.day.today {
				outline: 2px dashed var(--mo-color-gray-transparent);
			}

			.day.navigation {
				background: var(--mo-color-transparent-gray-3);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex alignItems='center' justifyItems='center'>
				<mo-grid
					rows='repeat(auto-fill, var(--mo-calendar-day-size))'
					columns='repeat(7, var(--mo-calendar-day-size))'
				>
					${this.includeWeekNumbers === false ? html.nothing : html`<div></div>`}

					${this.navigatingValue.weekDayNames.map(dayName => html`
						<mo-flex alignItems='center' justifyContent='center' class='dayName'>
							${dayName.charAt(0).toUpperCase() + dayName.charAt(1)}
						</mo-flex>
					`)}
				</mo-grid>

				${this.days.map(([weekNumber, days]) => html`
					${this.includeWeekNumbers === false ? html.nothing : html`
						<div class='weekNumber'>${weekNumber}</div>
					`}

					<mo-selectable-list>
						${days.map((day) => html`
							<mo-selectable-list-item
								class=${classMap(this.getDayElementClasses(day))}
								@click=${() => this.handleDayClick(day)}
							>
								${day.getDate()}
							</mo-selectable-list-item>
						`)}

					</mo-selectable-list>
				`)}
			</mo-flex>
		`
	}

	private * rangeOf(start: DateTime, end: DateTime) {
		while (!start.isAfter(end)) {
			yield start
			start = start.add({ days: 1 })
		}
	}

	protected getDayTemplate(day: DateTime) {
		return html`
			<mo-flex class=${classMap(this.getDayElementClasses(day))} @click=${() => this.handleDayClick(day)}>
				${day.format({ day: 'numeric' })}
			</mo-flex>
		`
	}

	protected handleDayClick(day: DateTime) {
		day
	}

	@memoizeExpiring(60_000)
	private get now() {
		return new DateTime()
	}

	protected getDayElementClasses(day: DateTime): ClassInfo {
		return {
			day: true,
			today: this.now.year === day.year && this.now.month === day.month && this.now.day === day.day,
			isInMonth: day.month === this.navigatingValue.month
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}