import { Component, css, component, html, property, event, repeat, state, unsafeCSS } from '@a11d/lit'
import { CalendarDatesController } from './CalendarDatesController.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'

/**
 * @fires dateClick - Dispatched when a date is clicked, with the clicked date as detail.
 */
@component('mo-calendar')
export class Calendar extends Component {
	@event() readonly dateClick!: EventDispatcher<DateTime>

	@property({ type: Object }) value?: DateTimeRange
	@property({ type: Object, updated(this: Calendar) { this.setView(this.precision) } }) precision!: FieldDateTimePrecision
	@property({ type: Boolean, reflect: true }) includeWeek = false

	@state() view = FieldDateTimePrecision.Day

	private readonly datesController = new CalendarDatesController(this)

	get navigationDate() { return this.datesController.navigationDate }
	async setNavigatingValue(date: DateTime, behavior: 'instant' | 'smooth' = 'instant') {
		this.datesController.disableObservers = true
		this.datesController.navigationDate = date
		await this.updateComplete
		await new Promise(r => setTimeout(r, 10))
		this.renderRoot.querySelector<HTMLElement>(`.${this.view}[data-navigating]`)
			?.scrollIntoView({ block: 'center', behavior })
		await new Promise(r => setTimeout(r, behavior === 'instant' ? 10 : 100))
		this.datesController.disableObservers = false
	}

	setView(view: FieldDateTimePrecision, navigationDate = this.datesController.navigationDate) {
		this.view = view
		this.setNavigatingValue(navigationDate)
	}

	static override get styles() {
		const year = unsafeCSS(FieldDateTimePrecision.Year.key)
		const month = unsafeCSS(FieldDateTimePrecision.Month.key)
		const day = unsafeCSS(FieldDateTimePrecision.Day.key)
		return css`
			:host {
				--mo-calendar-item-size: 2.25rem;
				flex: 1;
			}

			.scroller {
				height: min(450px, 100vh);

				display: grid;
				position: relative;
				scrollbar-width: none;
				overflow-x: hidden;
				scroll-behavior: smooth;

				&[data-view=${day}] {
					grid-template-columns: repeat(1, 1fr);
				}

				&[data-view=${month}] {
					grid-template-columns: repeat(3, 1fr);
				}

				&[data-view=${year}] {
					grid-template-columns: repeat(5, 1fr);
				}
			}

			.year, .month, .day {
				display: flex;
				align-items: center;
				justify-content: center;
				text-align: center;
				transition: 0.2s;

				user-select: none;

				font-weight: 500;

				border-radius: var(--mo-border-radius);

				&:hover {
					background: var(--mo-color-transparent-gray-3);
				}

				&[data-now] {
					outline: 2px dashed var(--mo-color-gray-transparent);
				}

				&[data-start], &[data-end] {
					background: var(--mo-color-accent-transparent);
					opacity: 1;
					color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground)) !important;
				}

				&[data-in-range] {
					background: color-mix(in srgb, var(--mo-color-accent), transparent 92%);
				}
			}

			/* Headings */
			.year[data-view=${month}], .month[data-view=${day}] {
				font-size: 1.125rem;
				font-weight: 500;
				height: 2rem;
				padding: 0.5rem;
			}

			/* Selection */
			.year[data-view=${year}], .month[data-view=${month}], .day {
				opacity: 0.875;
				font-size: 0.94rem;
				cursor: pointer;
				height: var(--mo-calendar-item-size);
			}

			.year {
				&[data-view=${day}] {
					display: none;
				}
				&:not([data-view=${year}]) {
					grid-column: -1 / 1;
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
				}
				padding-inline: 0.5rem;
			}

			.month-container {
				width: 100%;
				position: relative;
				&[data-view=${day}] {
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

				&[data-view=${month}] {
					& > mo-grid {
						display: none;
					}
				}
			}

			.weekdays {
				text-align: center;
				opacity: 0.5;
				font-size: 0.75rem;
				font-weight: 500;
				grid-column: -1 / 1;
				user-select: none;
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
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.week-container {
				grid-column: 1 / -1;
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
			<div class='scroller' data-view=${this.view.key}>
				${repeat(this.datesController.data, d => d.toString(), d => this.getYearTemplate(d))}
			</div>
		`
	}

	private getYearTemplate(date: DateTime) {
		return html`
			${date.dayOfYear !== 1 ? html.nothing : html`
				<div class='year' role='button'
					data-view=${this.view.key}
					?data-navigating=${this.isNavigating(date, FieldDateTimePrecision.Year)}
					?data-now=${this.isNow(date, FieldDateTimePrecision.Year)}
					?data-start=${this.isStart(date, FieldDateTimePrecision.Year)}
					?data-end=${this.isEnd(date, FieldDateTimePrecision.Year)}
					?data-in-range=${this.isInRange(date, FieldDateTimePrecision.Year)}
					@click=${this.handleItemClick(date, FieldDateTimePrecision.Year)}
					${this.datesController.observerIntersectionNavigation(date, FieldDateTimePrecision.Month, FieldDateTimePrecision.Year)}
				>
					${date.format({ year: 'numeric' })}
				</div>
			`}

			${this.view < FieldDateTimePrecision.Month || date.day !== 1 ? html.nothing : this.getMonthTemplate(date)}
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
		return html`
			<mo-flex class='month-container' data-view=${this.view.key}>
				<div class='month' role='button'
					data-view=${this.view.key}
					?data-navigating=${this.isNavigating(date, FieldDateTimePrecision.Month)}
					?data-now=${this.isNow(date, FieldDateTimePrecision.Month)}
					?data-start=${this.isStart(date, FieldDateTimePrecision.Month)}
					?data-end=${this.isEnd(date, FieldDateTimePrecision.Month)}
					?data-in-range=${this.isInRange(date, FieldDateTimePrecision.Month)}
					@click=${this.handleItemClick(date, FieldDateTimePrecision.Month)}
					${this.datesController.observerIntersectionNavigation(date, FieldDateTimePrecision.Day)}
				>
					${date.format(this.view > FieldDateTimePrecision.Month ? { year: 'numeric', month: 'long' } : { month: 'long' })}
				</div>
				${this.view < FieldDateTimePrecision.Day ? html.nothing : html`
					<mo-grid justifyContent='center' autoRows='var(--mo-calendar-item-size)' columns=${this.view > FieldDateTimePrecision.Month ? this.columns : 'auto'}>
						${Calendar.weekDaysTemplate}
						${this.datesController.data.filter(d => d.year === date.year && d.month === date.month).map((day, _, month) => this.getWeekTemplate(day, month))}
					</mo-grid>
				`}
			</mo-flex>
		`
	}

	protected getWeekTemplate(date: DateTime, month: ReadonlyArray<DateTime>) {
		if (date.yearOfWeek === undefined || date.weekOfYear === undefined) {
			return this.getDayTemplate(date)
		}

		if (date !== month.find(d => d.weekOfYear === date.weekOfYear && d.yearOfWeek === date.yearOfWeek)) {
			return html.nothing
		}

		return html`
			<mo-grid class='week-container' columns='subgrid' data-view=${this.view.key}>
				${month.filter(d => d.weekOfYear === date.weekOfYear && d.yearOfWeek === date.yearOfWeek).map(day => this.getDayTemplate(day))}
			</mo-grid>
		`
	}

	private getDayTemplate(day: DateTime) {
		return html`
			${this.includeWeek === false || day.dayOfWeek !== 1 ? html.nothing : html`
				<div class='week' style='grid-column: week'>${day.weekOfYear}</div>
			`}
			<div tabindex='0' role='button' class='day'
				style='grid-column: ${this.getColumnName(day)}'
				?data-navigating=${this.isNavigating(day, FieldDateTimePrecision.Day)}
				?data-now=${this.isNow(day, FieldDateTimePrecision.Day)}
				?data-start=${this.isStart(day, FieldDateTimePrecision.Day)}
				?data-end=${this.isEnd(day, FieldDateTimePrecision.Day)}
				?data-in-range=${this.isInRange(day, FieldDateTimePrecision.Day)}
				@click=${this.handleItemClick(day, FieldDateTimePrecision.Day)}
			>
				${day.format({ day: 'numeric' })}
			</div>
		`
	}

	private handleItemClick = (date: DateTime, precision: FieldDateTimePrecision) => {
		return () => {
			if (this.precision === precision) {
				this.dateClick.dispatch(date)
				this.setNavigatingValue(date, 'smooth')
			} else {
				const nextView = this.view !== precision
					? precision
					: this.view === FieldDateTimePrecision.Year
						? FieldDateTimePrecision.Month
						: this.view === FieldDateTimePrecision.Month
							? FieldDateTimePrecision.Day
							: this.view
				this.setView(nextView, date)
			}
		}
	}

	private isNavigating(date: DateTime, precision: FieldDateTimePrecision) {
		return this.view === precision
			&& this.navigationDate.year === date.year
			&& (precision < FieldDateTimePrecision.Month || this.navigationDate.month === date.month)
			&& (precision < FieldDateTimePrecision.Day || this.navigationDate.day === date.day)
	}

	private isNow(date: DateTime, precision: FieldDateTimePrecision) {
		return this.view === precision && precision.equals(date, CalendarDatesController.today)
	}

	private isStart(date: DateTime, precision: FieldDateTimePrecision) {
		return precision === this.precision && !!this.value?.start && precision.equals(date, this.value?.start)
	}

	private isEnd(date: DateTime, precision: FieldDateTimePrecision) {
		return precision === this.precision && !!this.value?.end && precision.equals(date, this.value?.end)
	}

	private isInRange(date: DateTime, precision: FieldDateTimePrecision) {
		return precision === this.precision && !!this.value?.start && !!this.value?.end
			&& precision.isSmallerThan(this.value.start, date)
			&& precision.isSmallerThan(date, this.value.end)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-calendar': Calendar
	}
}