import { Component, css, component, html, property, classMap, type ClassInfo, state } from '@a11d/lit'
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

			.month {
				min-height: 270px;
				place-items: center;

				.heading {
					font-weight: 500;
					font-size: 16px;
					grid-column: 1 / -1;
					place-self: stretch;
					display: flex;
					align-items: center;
					margin-inline-start: 6px;
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
				border-radius: var(--mo-border-radius);
				cursor: pointer;
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

				&.outsideMonth {
					color: var(--mo-color-gray);
				}

				&.today {
					outline: 2px dashed var(--mo-color-gray-transparent);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<mo-grid class='month'
				rows='repeat(auto-fill, var(--mo-calendar-day-size))'
				columns=${this.includeWeekNumbers ? 'var(--mo-calendar-week-number-width) repeat(7, var(--mo-calendar-day-size))' : 'repeat(7, var(--mo-calendar-day-size))'}
			>
				<div class='heading' style='grid-column: 1 / -1'>
					${this.navigatingValue.format({ year: 'numeric' })}
					${this.navigatingValue.format({ month: 'long' })}
				</div>

				${this.includeWeekNumbers === false ? html.nothing : html`<div></div>`}

				${this.navigatingValue.weekDayNames.map(dayName => html`
					<div class='header'>
						${dayName.charAt(0).toUpperCase() + dayName.charAt(1)}
					</div>
				`)}

				${this.days.map(([weekNumber, days]) => html`
					${this.includeWeekNumbers === false ? html.nothing : html`<div class='week'>${weekNumber}</div>`}
					${days.map(day => this.getDayTemplate(day))}
				`)}
			</mo-grid>
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
			<mo-flex tabindex='0' class=${classMap(this.getDayElementClasses(day))} @click=${() => this.handleDayClick(day)}>
				${day.format({ day: 'numeric' })}
			</mo-flex>
		`
	}

	protected handleDayClick(day: DateTime) {
		day
	}

	@memoizeExpiring(60_000)
	private get today() { return new DateTime().dayStart }

	protected getDayElementClasses(day: DateTime): ClassInfo {
		return {
			day: true,
			today: this.today.equals(day.dayStart),
			outsideMonth: day.month !== this.navigatingValue.month
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}