import { Component, css, component, html, property, classMap, type ClassInfo, event, Controller, repeat } from '@a11d/lit'
import '@a11d/array.prototype.group'
import { observeIntersection } from '@3mo/intersection-observer'
import { MemoizeExpiring as memoizeExpiring } from 'typescript-memoize'

class CalendarDaysController extends Controller {
	@memoizeExpiring(60_000)
	static get today() { return new DateTime().dayStart }

	private static *generate(start: DateTime, count: number) {
		for (let i = 0; i < count; i++) {
			yield start.add({ days: i })
		}
	}

	private static _sampleWeek = new Array<DateTime>()
	static get sampleWeek() { return this._sampleWeek as ReadonlyArray<DateTime> }

	private static generateWeek() {
		const sample = [...CalendarDaysController.generate(CalendarDaysController.today, CalendarDaysController.today.daysInWeek * 2)]
		const indexOfFirstWeekStart = sample.findIndex(d => d.dayOfWeek === 1)
		const daysInWeek = sample[0]!.daysInWeek
		CalendarDaysController._sampleWeek = sample.slice(indexOfFirstWeekStart, indexOfFirstWeekStart + daysInWeek).map(d => d.dayStart)
	}

	static {
		CalendarDaysController.generateWeek()
	}

	constructor(override readonly host: Calendar) {
		super(host)
		this.navigationDate = CalendarDaysController.today
	}

	private _days = new Array<DateTime>()
	get days() { return this._days as ReadonlyArray<DateTime> }

	private get median() {
		return this.days[Math.floor(this._days.length / 2)]
	}

	private _navigationDate!: DateTime
	get navigationDate() { return this._navigationDate }
	set navigationDate(value) {
		if (value.year !== this.median?.year) {
			this._days = [...CalendarDaysController.generate(value.yearStart.add({ years: -2 }), value.daysInYear * 5)]
			this.host.requestUpdate()
		}

		this._navigationDate = value.dayStart
	}
}

/**
 * @fires dayClick - Dispatched when a day is clicked, with the clicked date as detail.
 */
@component('mo-calendar')
export class Calendar extends Component {
	@event() readonly dayClick!: EventDispatcher<DateTime>

	@property({ type: Boolean, reflect: true }) includeWeek = false

	@property() view: 'month' | 'day' = 'day'

	private readonly daysController = new CalendarDaysController(this)

	get navigationDate() { return this.daysController.navigationDate }

	async setNavigatingValue(date: DateTime, behavior: 'instant' | 'smooth' = 'instant') {
		this.daysController.navigationDate = date
		await this.updateComplete
		await new Promise(r => setTimeout(r, 0))
		this.scrollToNavigatingItem(behavior)
	}

	scrollToNavigatingItem(behavior: 'instant' | 'smooth' = 'instant') {
		this.renderRoot
			.querySelector<HTMLElement>(`.${this.view}[data-navigating]`)
			?.scrollIntoView({ block: 'center', behavior })
	}

	toggleView(navigatingDate: DateTime) {
		this.view = this.view === 'month' ? 'day' : 'month'
		this.setNavigatingValue(navigatingDate)
	}

	static override get styles() {
		return css`
			:host {
				--mo-calendar-day-size: 36px;
				--mo-calendar-week-number-width: var(--mo-calendar-day-size);
			}

			mo-scroller {
				height: min(450px, 100vh);
				--_gap: 0.5rem;

				&::part(container) {
					display: grid;
					position: relative;
					scrollbar-width: none;
					overflow-x: hidden;
					scroll-behavior: smooth;
				}

				&[data-view=day]::part(container) {
					grid-template-columns: 1fr;
					gap: var(--_gap);
				}

				&[data-view=month]::part(container) {
					grid-template-columns: repeat(3, 1fr);
				}
			}

			.year {
				&[data-view=month], &[data-view=year] {
					font-weight: 500;
					font-size: 1.1rem;
				}
				&[data-view=day] {
					display: none;
				}
				height: 2.5rem;
				border-block-start: 1px solid var(--mo-color-transparent-gray-3);
				text-align: center;
				user-select: none;
				grid-column: 1 / -1;
				font-size: large;
				padding-inline: 0.5rem;
				background: var(--mo-color-background);
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
						height: calc(100% + var(--_gap));
						inset-inline-start: calc(var(--_gap) * -0.5);
						inset-block: 0;
						background: var(--mo-color-transparent-gray-3);
					}
					&::after {
						content: ' ';
						position: absolute;
						display: inline-block;
						height: 1px;
						width: calc(100% + var(--_gap));
						inset-block-start: calc(var(--_gap) * -0.5);
						inset-inline: 0;
						background: var(--mo-color-transparent-gray-3);
					}
				}
			}

			.month {
				&[data-view=day] {
					padding-block: 0.75rem;
					font-weight: 500;
					font-size: 1.125rem;
					grid-column: 1 / -1;
				}
				user-select: none;
				text-align: center;
				padding: 0.5rem;
				height: 2rem;
				background: var(--mo-color-background);
				place-items: center;
			}

			.weekdays {
				text-align: center;
				color: var(--mo-color-gray);
				grid-column: 1 / -1;
			}

			.week {
				opacity: 0.5;
			}

			.day {
				display: flex;
				text-align: center;
				border-radius: var(--mo-border-radius);
				cursor: pointer;
				font-weight: 500;
				user-select: none;
				opacity: 0.9;
				font-size: 0.94rem;
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
			}
		`
	}

	private get columns() {
		return [
			!this.includeWeek ? undefined : '[week] var(--mo-calendar-week-number-width)',
			...CalendarDaysController.sampleWeek.map(day => `[${this.getColumnName(day)}] var(--mo-calendar-day-size)`),
		].join(' ')
	}

	private getColumnName(date: DateTime) {
		return `day-${date.dayOfWeek}`
	}

	protected override get template() {
		return html`
			<mo-scroller data-view=${this.view}>
				${repeat(this.daysController.days, d => d.toString(), d => html`
					${this.getYearTemplate(d)}
					${this.getMonthTemplate(d)}
				`)}
			</mo-scroller>
		`
	}

	private getYearTemplate(date: DateTime) {
		return date.dayOfYear !== 1 ? html.nothing : html`
			<div class='year' role='button' data-view=${this.view}>
				${date.format({ year: 'numeric' })}
			</div>
		`
	}

	private getMonthTemplate(date: DateTime) {
		const handleNavigation = (date: DateTime, data: Array<IntersectionObserverEntry>) => {
			if (this.view === 'day' && data.some(entry => entry.isIntersecting)) {
				this.daysController.navigationDate = date
			}
		}

		return date.day !== 1 ? html.nothing : html`
			<mo-grid class='month-container' data-view=${this.view} columns=${this.view === 'day' ? this.columns : 'auto'}>
				<div class='month' role='button'
					?data-navigating=${this.navigationDate.year === date.year && this.navigationDate.month === date.month}
					data-view=${this.view}
					${observeIntersection(data => handleNavigation(date, data))}
					@click=${() => this.toggleView(date)}
				>
					${this.view === 'day' ? date.format({ year: 'numeric', month: 'long' }) : date.format({ month: 'long' })}
				</div>

				${this.view !== 'day' ? html.nothing : html`
					<mo-grid class='weekdays' columns='subgrid'>
						${this.includeWeek === false ? html.nothing : html`<div></div>`}
						${CalendarDaysController.sampleWeek.map((day, index) => html`
							<span style='grid-column: day-${index + 1}' title=${day.format({ weekday: 'long' })}>
								${day.format({ weekday: 'narrow' })}
							</span>
						`)}
					</mo-grid>
				`}

				${this.daysController.days.filter(d => d.year === date.year && d.month === date.month).map(day => this.getDayTemplate(day))}
			</mo-grid>
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
		return {
			day: true,
			today: CalendarDaysController.today.year === day.year && CalendarDaysController.today.month === day.month && CalendarDaysController.today.day === day.day,
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}