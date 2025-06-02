import { Controller, html, type DirectiveResult } from '@a11d/lit'
import { observeIntersection } from '@3mo/intersection-observer'
import { MemoizeExpiring as memoizeExpiring } from 'typescript-memoize'
import type { Calendar } from './Calendar.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'

export class CalendarDatesController extends Controller {
	@memoizeExpiring(60_000)
	static get today() { return new DateTime().dayStart }

	private static *generate(start: DateTime, count: number, step: 'days' | 'months' | 'years') {
		for (let i = 0; i < count; i++) {
			yield start.add({ [step]: i })
		}
	}

	private static _sampleWeek = new Array<DateTime>()
	static get sampleWeek() { return this._sampleWeek as ReadonlyArray<DateTime> }

	private static generateWeek() {
		const sample = [...CalendarDatesController.generate(CalendarDatesController.today, CalendarDatesController.today.daysInWeek * 2, 'days')]
		const indexOfFirstWeekStart = sample.findIndex(d => d.dayOfWeek === 1)
		const daysInWeek = sample[0]!.daysInWeek
		CalendarDatesController._sampleWeek = sample.slice(indexOfFirstWeekStart, indexOfFirstWeekStart + daysInWeek).map(d => d.dayStart)
	}

	static {
		CalendarDatesController.generateWeek()
	}

	disableObservers = false

	observerIntersectionNavigation(date: DateTime, ...views: Array<FieldDateTimePrecision>) {
		return !views.includes(this.host.view) ? html.nothing : observeIntersection(data => {
			if (!this.disableObservers && data.some(entry => entry.isIntersecting)) {
				this.navigationDate = date
			}
		}) as DirectiveResult<any>
	}

	constructor(override readonly host: Calendar) {
		super(host)
		this.navigationDate = CalendarDatesController.today
	}

	private days = new Array<DateTime>()
	private months = new Array<DateTime>()
	private years = new Array<DateTime>()

	get data() {
		switch (this.host.view) {
			case FieldDateTimePrecision.Year:
				return this.years
			case FieldDateTimePrecision.Month:
				return this.months
			default:
				return this.days
		}
	}

	private _navigationDate!: DateTime
	get navigationDate() { return this._navigationDate }
	set navigationDate(value) {
		let changed = false

		const daysOffset = 75
		if (this.host.view === FieldDateTimePrecision.Day && (!this.days.length || value.isBefore(this.days.at(daysOffset)!) || value.isAfter(this.days.at(-daysOffset)!))) {
			this.days = [...CalendarDatesController.generate(
				value.yearStart.add({ years: -1 }),
				value.daysInYear * 3,
				'days',
			)]
			changed = true
		}

		const monthsOffset = 25
		if (this.host.view === FieldDateTimePrecision.Month && (!this.months.length || value.isBefore(this.months.at(monthsOffset)!) || value.isAfter(this.months.at(-monthsOffset)!))) {
			this.months = [...CalendarDatesController.generate(
				value.yearStart.add({ years: -10 }),
				value.monthsInYear * 20,
				'months',
			)]
			changed = true
		}

		const yearsOffset = 15
		if (this.host.view === FieldDateTimePrecision.Year && (!this.years.length || value.isBefore(this.years.at(yearsOffset)!) || value.isAfter(this.years.at(-yearsOffset)!))) {
			this.years = [...CalendarDatesController.generate(
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