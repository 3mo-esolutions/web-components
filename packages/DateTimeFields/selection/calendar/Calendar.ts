import { Component, css, component, html, property, classMap, type ClassInfo, state } from '@a11d/lit'
import '@a11d/array.prototype.group'
import { MemoizeExpiring as memoizeExpiring } from 'typescript-memoize'
import { Temporal } from 'temporal-polyfill'

@component('mo-calendar')
export class Calendar extends Component {
	@property({ type: Boolean, reflect: true }) includeWeekNumbers = false
	@property({
		type: Object,
		updated(this: Calendar) {
			this.month = Temporal.PlainYearMonth.from(this.navigatingValue, { overflow: 'reject' })
		}
	}) navigatingValue = new DateTime

	@state() private month?: Temporal.PlainYearMonth

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
				border-radius: 100px;
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

				&:not(.isInMonth) {
					color: var(--mo-color-gray);
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

				${new Array(this.month?.daysInMonth ?? 0).fill(undefined).map((_, index) => html`
					${this.includeWeekNumbers === false ? html.nothing : html`<div class='week'>${index}</div>`}
					${this.getDayTemplate(this.month!, index + 1)}
				`)}
			</mo-grid>
		`
	}

	protected getDayTemplate(yearMonth: Temporal.PlainYearMonth, day: number) {
		return html`
			<mo-flex tabindex='0'
				class=${classMap(this.getDayElementClasses(yearMonth, day))}
				@click=${() => this.handleDayClick(DateTime.from(yearMonth.toPlainDate({ day }).toZonedDateTime({ timeZone: this.navigatingValue.timeZone })))}
			>
				${day.format()}
			</mo-flex>
		`
	}

	protected handleDayClick(day: DateTime) {
		day
	}

	@memoizeExpiring(60_000)
	private get now() { return new DateTime }

	protected getDayElementClasses({ year, month }: Temporal.PlainYearMonth, day: number): ClassInfo {
		return {
			day: true,
			today: this.now.year === year && this.now.month === month && this.now.day === day,
			isInMonth: month === this.navigatingValue.month
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}