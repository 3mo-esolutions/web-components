import { Component, css, component, html, property, classMap, type ClassInfo, event, Controller, repeat } from '@a11d/lit'
import '@a11d/array.prototype.group'
import { observeIntersection } from '@3mo/intersection-observer'
import '@3mo/virtualized-list'
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

	private days = new Array<DateTime>()

	private get median() {
		const index = Math.floor(this.days.length / 2)
		return this.days[index]!
	}

	private _navigationDate!: DateTime
	get navigationDate() { return this._navigationDate }
	set navigationDate(value) {
		if (value.year !== this.median?.year) {
			this.days = [...CalendarDaysController.generate(value.yearStart.add({ years: -2 }), value.daysInYear * 5)]
			this._navigationRange = [...this.days]
			this.host.requestUpdate()
		}

		this._navigationDate = value.dayStart
	}

	private _navigationRange = new Array<DateTime>()
	get navigationRange() { return this._navigationRange as ReadonlyArray<DateTime> }

	filter(...parameters: Parameters<Array<DateTime>['filter']>) {
		return this.days.filter(...parameters)
	}

	[Symbol.iterator]() {
		return this.navigationRange[Symbol.iterator]()
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
		await new Promise(resolve => setTimeout(resolve, 200))
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

				&::part(container) {
					display: grid;
					position: relative;
					scrollbar-width: none;
					overflow-x: hidden;
					scroll-behavior: smooth;
				}

				&[data-view=day]::part(container) {
					grid-template-columns: repeat(2, 1fr);
					gap: 0.5rem;
				}

				&[data-view=month]::part(container) {
					grid-template-columns: repeat(3, 1fr);
				}
			}

			.year {
				&[data-view=month], &[data-view=year] {
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
					font-weight: 500;
					font-size: 1.1rem;
					justify-content: center;
				}
				min-height: auto;
				grid-column: 1 / -1;
				font-size: large;
				padding-inline: 0.5rem;
				background: var(--mo-color-background);
			}

			.month-container {
				width: 100%;
			}

			.month {
				&[data-view=day] {
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
					padding-block: 0.75rem;
					font-weight: 500;
					font-size: 1.125rem;
					justify-content: center;
					grid-column: 1 / -1;
				}
				padding: 0.5rem;
				background: var(--mo-color-background);
				place-items: center;
				min-height: auto;
				justify-content: center;
			}

			.weekdays {
				text-align: center;
				color: var(--mo-color-gray);
				grid-column: 1 / -1;
			}

			.week {
				color: var(--mo-color-gray);
			}

			.day {
				display: flex;
				text-align: center;
				min-height: auto;
				border-radius: var(--mo-border-radius);
				cursor: pointer;
				font-weight: 500;
				user-select: none;
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
				${repeat(this.daysController.navigationRange, d => d.toString(), d => html`
					${this.getYearTemplate(d)}
					${this.getMonthTemplate(d)}
				`)}
			</mo-scroller>
		`
	}

	private getYearTemplate(date: DateTime) {
		return date.dayOfYear !== 1 ? html.nothing : html`
			<mo-list-item class='year' data-view=${this.view}>
				${date.format({ year: 'numeric' })}
			</mo-list-item>
		`
	}

	private getMonthTemplate(date: DateTime) {
		return date.day !== 1 ? html.nothing : html`
			<mo-grid class='month-container' columns=${this.view === 'day' ? this.columns : 'auto'}>
				<mo-list-item class='month'
					?data-navigating=${this.navigationDate.year === date.year && this.navigationDate.month === date.month}
					data-view=${this.view}
					${observeIntersection(data => this.handleNavigation(date, data))}
					@click=${() => this.toggleView(date)}
				>
					${this.view === 'day' ? date.format({ year: 'numeric', month: 'long' }) : date.format({ month: 'long' })}
				</mo-list-item>

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

				${this.daysController.filter(d => d.year === date.year && d.month === date.month).map(day => this.getDayTemplate(day))}
			</mo-grid>
		`
	}

	private handleNavigation(date: DateTime, data: Array<IntersectionObserverEntry>) {
		if (data.some(entry => entry.isIntersecting)) {
			date
			this.daysController.navigationDate = date
			// this.updateComplete.then(() => this.scrollToNavigatingItem())
		}
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