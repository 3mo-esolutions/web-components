import { Component, css, component, html, property, classMap, type ClassInfo, event, Controller, repeat } from '@a11d/lit'
import '@a11d/array.prototype.group'
import { observeIntersection } from '@3mo/intersection-observer'
import { MemoizeExpiring as memoizeExpiring } from 'typescript-memoize'

class CalendarDatesController extends Controller {
	@memoizeExpiring(60_000)
	static get today() { return new DateTime().dayStart }

	private static *generate(start: DateTime, count: number, step = 'days') {
		for (let i = 0; i < count; i++) {
			yield start.add({ [step]: i })
		}
	}

	private static _sampleWeek = new Array<DateTime>()
	static get sampleWeek() { return this._sampleWeek as ReadonlyArray<DateTime> }

	private static generateWeek() {
		const sample = [...CalendarDatesController.generate(CalendarDatesController.today, CalendarDatesController.today.daysInWeek * 2)]
		const indexOfFirstWeekStart = sample.findIndex(d => d.dayOfWeek === 1)
		const daysInWeek = sample[0]!.daysInWeek
		CalendarDatesController._sampleWeek = sample.slice(indexOfFirstWeekStart, indexOfFirstWeekStart + daysInWeek).map(d => d.dayStart)
	}

	static {
		CalendarDatesController.generateWeek()
	}

	constructor(override readonly host: Calendar) {
		super(host)
		this.navigationDate = CalendarDatesController.today
	}

	private _days = new Array<DateTime>()
	private _months = new Array<DateTime>()
	private _years = new Array<DateTime>()

	get data() {
		switch (this.host.view) {
			case 'month':
				return this._months
			case 'year':
				return this._years
			default:
				return this._days
		}
	}

	private _navigationDate!: DateTime
	get navigationDate() { return this._navigationDate }
	set navigationDate(value) {
		let changed = false

		const daysOffset = 80
		if (this.host.view === 'day' && (!this._days.length || value.isBefore(this._days.at(daysOffset)!) || value.isAfter(this._days.at(-daysOffset)!))) {
			this._days = [...CalendarDatesController.generate(
				value.yearStart.add({ years: -1 }),
				value.daysInYear * 3,
				'days',
			)]
			changed = true
		}

		const monthsOffset = 25
		if (this.host.view === 'month' && (!this._months.length || value.isBefore(this._months.at(monthsOffset)!) || value.isAfter(this._months.at(-monthsOffset)!))) {
			this._months = [...CalendarDatesController.generate(
				value.yearStart.add({ years: -10 }),
				value.monthsInYear * 20,
				'months',
			)]
			changed = true
		}

		const yearsOffset = 10
		if (this.host.view === 'year' && (!this._years.length || value.isBefore(this._years.at(yearsOffset)!) || value.isAfter(this._years.at(-yearsOffset)!))) {
			this._years = [...CalendarDatesController.generate(
				value.yearStart.add({ years: -100 }),
				200,
				'years',
			)]
			changed = true
		}

		if (changed) {
			this.host.requestUpdate()
		}

		this._navigationDate = value.dayStart
	}
}

type CalendarView = 'year' | 'month' | 'day'

/**
 * @fires dayClick - Dispatched when a day is clicked, with the clicked date as detail.
 */
@component('mo-calendar')
export class Calendar extends Component {
	@event() readonly dayClick!: EventDispatcher<DateTime>

	@property({ type: Boolean, reflect: true }) includeWeek = false

	@property() view: CalendarView = 'day'

	private readonly daysController = new CalendarDatesController(this)

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
				}
				border-block-start: 1px solid var(--mo-color-transparent-gray-3);
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
				${repeat(this.daysController.data, d => d.toString(), d => html`
					${this.getYearTemplate(d)}
					${this.getMonthTemplate(d)}
				`)}
			</mo-scroller>
		`
	}

	private observerIntersectionNavigation(date: DateTime, ...views: CalendarView[]) {
		return !views.includes(this.view) ? html.nothing : observeIntersection(data => {
			if (data.some(entry => entry.isIntersecting)) {
				this.daysController.navigationDate = date
			}
		})
	}

	private getYearTemplate(date: DateTime) {
		return date.dayOfYear !== 1 ? html.nothing : html`
			<div class='year' role='button'
				data-view=${this.view}
				${this.observerIntersectionNavigation(date, 'month', 'year')}
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
					${this.observerIntersectionNavigation(date, 'day')}
					@click=${() => this.setView(date, this.view === 'day' ? 'month' : 'day')}
				>
					${this.view === 'day' ? date.format({ year: 'numeric', month: 'long' }) : date.format({ month: 'long' })}
				</div>
				<mo-grid autoRows='var(--mo-calendar-item-size)' columns=${this.view === 'day' ? this.columns : 'auto'}>
					${this.view !== 'day' ? html.nothing : Calendar.weekDaysTemplate}
					${this.daysController.data.filter(d => d.year === date.year && d.month === date.month).map(day => this.getDayTemplate(day))}
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
		return {
			day: true,
			today: CalendarDatesController.today.year === day.year && CalendarDatesController.today.month === day.month && CalendarDatesController.today.day === day.day,
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}