import { Component, css, component, html, property, classMap, type ClassInfo, state, event } from '@a11d/lit'
import '@a11d/array.prototype.group'
import { MemoizeExpiring as memoizeExpiring } from 'typescript-memoize'

/**
 * @fires dayClick - Dispatched when a day is clicked, with the clicked date as detail.
 */
@component('mo-calendar')
export class Calendar extends Component {
	@event() readonly dayClick!: EventDispatcher<DateTime>

	private static *rangeOf(start: DateTime, end: DateTime) {
		while (!start.isAfter(end)) {
			yield start
			start = start.add({ days: 1 })
		}
	}

	@property({ type: Boolean, reflect: true }) includeWeek = false
	@property({
		type: Object,
		updated(this: Calendar) {
			const start = this.navigatingValue.monthStart.weekStart
			const end = this.navigatingValue.monthEnd.weekEnd
			this.days = [...Calendar.rangeOf(start, end)]
		}
	}) navigatingValue = new DateTime

	@state() private days = new Array<DateTime>()

	static override get styles() {
		return css`
			:host {
				--mo-calendar-day-size: 36px;
				--mo-calendar-week-number-width: var(--mo-calendar-day-size);
				padding: 0.5rem;
			}

			.month {
				place-items: center;

				.heading {
					font-weight: 500;
					font-size: 16px;
					grid-column: 1 / -1;
					place-self: stretch;
					display: flex;
					align-items: center;
					padding-inline-start: 6px;
					padding-block-end: 0.5rem;
				}

				.header {
					text-align: center;
					color: var(--mo-color-gray);
					padding-block: 0.25rem
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

	private get columns() {
		const daysInWeek = this.days[0]?.daysInWeek ?? 7
		return [
			!this.includeWeek ? undefined : '[week] var(--mo-calendar-week-number-width)',
			...this.days.slice(0, daysInWeek).map(day => `[${this.getColumnName(day)}] var(--mo-calendar-day-size)`),
		].join(' ')
	}

	private getColumnName(date: DateTime) {
		return `day-${date.dayOfWeek}`
	}

	protected override get template() {
		return html`
			<mo-grid class='month'
				rows='repeat(auto-fill, var(--mo-calendar-day-size))'
				columns=${this.columns}
			>
				<div class='heading' style='grid-column: 1 / -1'>
					${this.navigatingValue.format({ year: 'numeric' })}
					${this.navigatingValue.format({ month: 'long' })}
				</div>

				<mo-grid class='header' columns='subgrid' style='grid-column: 1 / -1'>
					${this.includeWeek === false ? html.nothing : html`<div></div>`}
					${this.days.slice(0, this.days[0]?.daysInWeek).map(day => html`
						<span style='grid-column: ${this.getColumnName(day)}' title=${day.format({ weekday: 'long' })}>
							${day.format({ weekday: 'narrow' })}
						</span>
					`)}
				</mo-grid>

				${this.days.map(day => html`
					${this.includeWeek === false || day.dayOfWeek !== 1 ? html.nothing : html`
						<div class='week' style='grid-column: week'>${day.weekOfYear}</div>
					`}
					<mo-flex tabindex='0'
						style='grid-column: ${this.getColumnName(day)}'
						class=${classMap(this.getDayElementClasses(day))}
						@click=${() => this.dayClick.dispatch(day)}
					>
						${day.format({ day: 'numeric' })}
					</mo-flex>
				`)}
			</mo-grid>
		`
	}

	protected getDayElementClasses(day: DateTime): ClassInfo {
		return {
			day: true,
			today: this.today.equals(day.dayStart),
			outsideMonth: day.month !== this.navigatingValue.month
		}
	}

	@memoizeExpiring(60_000)
	private get today() { return new DateTime().dayStart }
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}