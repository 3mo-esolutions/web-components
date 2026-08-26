import { Controller, html, type DirectiveResult } from '@a11d/lit'
import { observeIntersection } from '@3mo/intersection-observer'
import { Memoize as memoize, clear } from 'typescript-memoize'
import { Localizer } from '@3mo/localization'
import type { Calendar } from './Calendar.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'

export class CalendarDatesController extends Controller {
	private static readonly cacheKey = 'CalendarDatesController'

	@memoize({ expiring: 60_000, tags: [CalendarDatesController.cacheKey] })
	static get today() { return new DateTime().dayStart }

	private static *generate(start: DateTime, count: number, step: 'days' | 'months' | 'years') {
		for (let i = 0; i < count; i++) {
			yield start.add({ [step]: i })
		}
	}

	private static _sampleWeek?: ReadonlyArray<DateTime>
	static get sampleWeek() { return CalendarDatesController._sampleWeek ??= CalendarDatesController.generateWeek() }

	private static generateWeek(): ReadonlyArray<DateTime> {
		const sample = [...CalendarDatesController.generate(CalendarDatesController.today, CalendarDatesController.today.daysInWeek * 2, 'days')]
		const indexOfFirstWeekStart = sample.findIndex(d => d.dayOfWeek === 1)
		const daysInWeek = sample[0]!.daysInWeek
		return sample.slice(indexOfFirstWeekStart, indexOfFirstWeekStart + daysInWeek).map(d => d.dayStart)
	}

	private static readonly connectedControllers = new Set<CalendarDatesController>()

	static {
		// `DateTime` freezes its calendar and time zone at construction, so every date which has already
		// been generated still belongs to the previous language's calendar. Without discarding them,
		// switching language only re-formats the existing Gregorian grid instead of rebuilding it.
		Localizer.languages.change.subscribe(() => {
			// Deferred so that every other subscriber has run first — in particular `DateTime`, which
			// clears its own memoized calendar and time zone on the very same event. Regenerating any
			// date before that happens would just reproduce the outgoing calendar.
			queueMicrotask(() => {
				clear([CalendarDatesController.cacheKey])
				CalendarDatesController._sampleWeek = undefined
				for (const controller of CalendarDatesController.connectedControllers) {
					controller.invalidate()
				}
			})
		})
	}

	override hostConnected() {
		CalendarDatesController.connectedControllers.add(this)
	}

	override hostDisconnected() {
		CalendarDatesController.connectedControllers.delete(this)
	}

	/** Discards every generated date and regenerates them for the current calendar. */
	private invalidate() {
		this.days = []
		this.months = []
		this.years = []
		this.navigationDate = DateTime.from(this._navigationDate.valueOf())
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
		if ([FieldDateTimePrecision.Day, FieldDateTimePrecision.Week].includes(this.host.view) && (!this.days.length || value.isBefore(this.days.at(daysOffset)!) || value.isAfter(this.days.at(-daysOffset)!))) {
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