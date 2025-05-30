import { Component, css, component, html, property, classMap, type ClassInfo, event, repeat, state } from '@a11d/lit'
import { CalendarDatesController } from './CalendarDatesController.js'

export type CalendarView = 'year' | 'month' | 'day'

/**
 * @fires dayClick - Dispatched when a day is clicked, with the clicked date as detail.
 */
@component('mo-calendar')
export class Calendar extends Component {
	@event() readonly dayClick!: EventDispatcher<DateTime>

	@property({ type: Object }) value?: DateTimeRange
	@property({ type: Boolean, reflect: true }) includeWeek = false

	@state() view: CalendarView = 'day'

	private readonly datesController = new CalendarDatesController(this)

	get navigationDate() { return this.datesController.navigationDate }

	async setNavigatingValue(date: DateTime, behavior: 'instant' | 'smooth' = 'instant') {
		this.datesController.navigationDate = date
		await this.updateComplete
		await new Promise(r => setTimeout(r, 0))
		this.scrollToNavigatingItem(behavior)
	}

	scrollToNavigatingItem(behavior: 'instant' | 'smooth' = 'instant') {
		this.renderRoot
			.querySelector<HTMLElement>(`.${this.view}[data-navigating]`)
			?.scrollIntoView({ block: 'center', behavior })
	}

	setView(navigatingDate: DateTime, view: CalendarView) {
		this.view = view
		this.setNavigatingValue(navigatingDate)
	}

	static override get styles() {
		return css`
			:host {
				--mo-calendar-item-size: 2.25rem;
			}

			mo-scroller {
				height: min(450px, 100vh);

				&::part(container) {
					display: grid;
					position: relative;
					scrollbar-width: none;
					overflow-x: hidden;
					scroll-behavior: smooth;
				}

				&[data-view=day]::part(container) {
					grid-template-columns: repeat(1, 1fr);
				}

				&[data-view=month]::part(container) {
					grid-template-columns: repeat(3, 1fr);
				}

				&[data-view=year]::part(container) {
					grid-template-columns: repeat(5, 1fr);
				}
			}

			.year, .month, .day {
				display: flex;
				align-items: center;
				justify-content: center;
				text-align: center;

				user-select: none;
				-webkit-user-select: none;

				font-weight: 500;

				border-radius: var(--mo-border-radius);

				&:hover {
					background: var(--mo-color-transparent-gray-3);
				}
			}

			/* Headings */
			.year[data-view=month], .month[data-view=day] {
				font-size: 1.125rem;
				font-weight: 500;
				height: 2rem;
				padding: 0.5rem;
			}

			/* Selection */
			.year[data-view=year], .month[data-view=month], .day {
				opacity: 0.875;
				font-size: 0.94rem;
				cursor: pointer;
				height: var(--mo-calendar-item-size);
			}

			.year {
				&[data-view=day] {
					display: none;
				}
				&:not([data-view=year]) {
					grid-column: -1 / 1;
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
				}
				padding-inline: 0.5rem;
			}

			.month-container {
				width: 100%;
				position: relative;
				&[data-view=day] {
					&::before {
						content: ' ';
						position: absolute;
						display: inline-block;
						width: 1px;
						height: 100%;
						inset-block: 0;
						background: var(--mo-color-transparent-gray-3);
					}
					&::after {
						content: ' ';
						position: absolute;
						display: inline-block;
						height: 1px;
						width: 100%;
						inset-inline: 0;
						background: var(--mo-color-transparent-gray-3);
					}
				}

				& > mo-grid {
					padding-inline: 0.5rem;
					padding-block-end: 0.5rem;
					margin-block-start: -0.375rem;
				}
			}

			.weekdays {
				text-align: center;
				opacity: 0.5;
				font-size: 0.75rem;
				font-weight: 500;
				grid-column: -1 / 1;
				span {
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.month {
				padding-inline: 0.5rem;
			}

			.week {
				opacity: 0.5;
			}

			.day {
				width: var(--mo-calendar-item-size);
				height: var(--mo-calendar-item-size);

				&.start, &.end {
					background: var(--mo-color-accent-transparent);
					opacity: 1;
					color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground)) !important;
				}

				&.inRange {
					background: color-mix(in srgb, var(--mo-color-accent), transparent 92%);
				}
			}
		`
	}

	private get columns() {
		return [
			!this.includeWeek ? undefined : '[week] var(--mo-calendar-item-size)',
			...CalendarDatesController.sampleWeek.map(day => `[${this.getColumnName(day)}] var(--mo-calendar-item-size)`),
		].join(' ')
	}

	private getColumnName(date: DateTime) {
		return `day-${date.dayOfWeek}`
	}

	protected override get template() {
		return html`
			<mo-scroller data-view=${this.view}>
				${repeat(this.datesController.data, d => d.toString(), d => html`
					${this.getYearTemplate(d)}
					${this.getMonthTemplate(d)}
				`)}
			</mo-scroller>
		`
	}

	private getYearTemplate(date: DateTime) {
		return date.dayOfYear !== 1 ? html.nothing : html`
			<div class='year' role='button'
				data-view=${this.view}
				${this.datesController.observerIntersectionNavigation(date, 'month', 'year')}
				@click=${() => this.setView(date, this.view === 'year' ? 'month' : 'year')}
			>
				${date.format({ year: 'numeric' })}
			</div>
		`
	}

	private static get weekDaysTemplate() {
		return html`
			<mo-grid class='weekdays' columns='subgrid'>
				${CalendarDatesController.sampleWeek.map((day, index) => {
					const { narrow, short, long } = {
						narrow: day.format({ weekday: 'narrow' }),
						short: day.format({ weekday: 'short' }),
						long: day.format({ weekday: 'long' }),
					}
					return html`
						<span style='grid-column: day-${index + 1}' title=${long}>
							${long === short ? narrow : short}
						</span>
					`
				})}
			</mo-grid>
		`
	}

	private getMonthTemplate(date: DateTime) {
		return this.view === 'year' || date.day !== 1 ? html.nothing : html`
			<mo-flex class='month-container' data-view=${this.view}>
				<div class='month' role='button'
					?data-navigating=${this.navigationDate.year === date.year && this.navigationDate.month === date.month}
					data-view=${this.view}
					${this.datesController.observerIntersectionNavigation(date, 'day')}
					@click=${() => this.setView(date, this.view === 'day' ? 'month' : 'day')}
				>
					${this.view === 'day' ? date.format({ year: 'numeric', month: 'long' }) : date.format({ month: 'long' })}
				</div>
				<mo-grid autoRows='var(--mo-calendar-item-size)' columns=${this.view === 'day' ? this.columns : 'auto'}>
					${this.view !== 'day' ? html.nothing : Calendar.weekDaysTemplate}
					${this.datesController.data.filter(d => d.year === date.year && d.month === date.month).map(day => this.getDayTemplate(day))}
				</mo-grid>
			</mo-flex>
		`
	}

	private getDayTemplate(day: DateTime) {
		return this.view === 'month' ? html.nothing : html`
			${this.includeWeek === false || day.dayOfWeek !== 1 ? html.nothing : html`
				<div class='week' style='grid-column: week'>${day.weekOfYear}</div>
			`}
			<div tabindex='0' role='button'
				style='grid-column: ${this.getColumnName(day)}'
				?data-navigating=${this.navigationDate.year === day.year && this.navigationDate.month === day.month && this.navigationDate.day === day.day}
				class=${classMap(this.getDayElementClasses(day))}
				@click=${() => { this.dayClick.dispatch(day); this.setNavigatingValue(day, 'smooth') }}
			>
				${day.format({ day: 'numeric' })}
			</div>
		`
	}

	protected getDayElementClasses(day: DateTime): ClassInfo {
		const value = day.valueOf()
		const start = value === this.value?.start?.dayStart.valueOf()
		const end = value === this.value?.end?.dayStart.valueOf()
		const inRange = value > (this.value?.start?.dayStart.valueOf() ?? Infinity) && value < (this.value?.end?.dayStart.valueOf() ?? 0)
		return {
			day: true,
			today: CalendarDatesController.today.year === day.year && CalendarDatesController.today.month === day.month && CalendarDatesController.today.day === day.day,
			start,
			end,
			inRange,
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}