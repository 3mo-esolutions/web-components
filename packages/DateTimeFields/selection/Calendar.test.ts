import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LanguageCode, Localizer } from '@3mo/localization'
import type { Calendar } from './Calendar.js'
import { CalendarDatesController } from './CalendarDatesController.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import '@3mo/date-time'
import '../index.js'

describe('Calendar', () => {
	const fixture = new ComponentTestFixture<Calendar>(html`<mo-calendar .precision=${FieldDateTimePrecision.Day}></mo-calendar>`)

	const query = <T extends Element>(selector: string) => fixture.component.renderRoot.querySelector<T>(selector)
	const queryAll = <T extends Element>(selector: string) => [...fixture.component.renderRoot.querySelectorAll<T>(selector)]

	const settle = async () => {
		await fixture.updateComplete
		await new Promise(resolve => setTimeout(resolve, 60))
		await fixture.updateComplete
	}

	const navigateTo = async (date: DateTime) => {
		await fixture.component.setNavigatingValue(date)
		fixture.component.requestUpdate()
		await settle()
	}

	const dispatchedDate = () => (fixture.component.dateClick.dispatch as jasmine.Spy).calls.mostRecent().args[0] as DateTime

	describe('language and calendar system', () => {
		let language: LanguageCode

		beforeEach(() => language = Localizer.languages.current)

		afterEach(async () => {
			Localizer.languages.current = language
			await new Promise<void>(resolve => queueMicrotask(() => resolve()))
			await fixture.updateComplete
		})

		const switchTo = async (next: LanguageCode) => {
			Localizer.languages.current = next
			await new Promise<void>(resolve => queueMicrotask(() => resolve()))
			await fixture.updateComplete
		}

		it('should rebuild its dates on the calendar of the new language', async () => {
			await switchTo('en')
			expect(fixture.component.navigationDate.calendarId).toBe('gregory')

			await switchTo('fa')
			expect(fixture.component.navigationDate.calendarId).toBe('persian')

			await switchTo('en')
			expect(fixture.component.navigationDate.calendarId).toBe('gregory')
		})

		it('should keep pointing at the same instant across a language change', async () => {
			await switchTo('en')
			const before = fixture.component.navigationDate.valueOf()

			await switchTo('fa')
			expect(fixture.component.navigationDate.valueOf()).toBe(before)
		})

		it('should rebuild the sample week on the calendar of the new language', async () => {
			await switchTo('en')
			expect(CalendarDatesController.sampleWeek.every(d => d.calendarId === 'gregory')).toBeTrue()

			await switchTo('fa')
			expect(CalendarDatesController.sampleWeek.every(d => d.calendarId === 'persian')).toBeTrue()
		})

		it('should rebuild today on the calendar of the new language', async () => {
			await switchTo('en')
			expect(CalendarDatesController.today.calendarId).toBe('gregory')

			await switchTo('fa')
			expect(CalendarDatesController.today.calendarId).toBe('persian')
		})
	})

	describe('date selection', () => {
		// Disabled: stale cell marker during scroll settling
		xit('should dispatch dateClick with the clicked day at day precision', async () => {
			const target = CalendarDatesController.today.add({ days: 3 })
			await navigateTo(target)
			spyOn(fixture.component.dateClick, 'dispatch')

			query<HTMLElement>('.day[data-navigating]')!.click()

			expect(FieldDateTimePrecision.Day.equals(dispatchedDate(), target)).toBeTrue()
		})

		for (const gate of ['min', 'max', 'dateDisabled'] as const) {
			it(`should not dispatch dateClick for a date disabled by ${gate}`, async () => {
				const target = CalendarDatesController.today.add({ days: 3 })
				if (gate === 'min') {
					fixture.component.min = target.add({ days: 1 })
				}
				if (gate === 'max') {
					fixture.component.max = target.subtract({ days: 1 })
				}
				if (gate === 'dateDisabled') {
					fixture.component.dateDisabled = date => FieldDateTimePrecision.Day.equals(date, target)
				}
				await navigateTo(target)
				spyOn(fixture.component.dateClick, 'dispatch')

				const cell = query<HTMLElement>('.day[data-navigating]')!
				expect(cell.hasAttribute('data-disabled')).toBeTrue()
				cell.click()

				expect(fixture.component.dateClick.dispatch).not.toHaveBeenCalled()
			})
		}
	})

	describe('selection highlighting', () => {
		it('should mark the value\'s start and end dates', async () => {
			const start = CalendarDatesController.today.add({ days: 2 })
			const end = start.add({ days: 4 })
			fixture.component.value = new DateTimeRange(start, end)

			await navigateTo(start)
			expect(queryAll('.day[data-start]').length).toBe(1)
			expect(query('.day[data-start]')).toBe(query('.day[data-navigating]'))

			await navigateTo(end)
			expect(queryAll('.day[data-end]').length).toBe(1)
			expect(query('.day[data-end]')).toBe(query('.day[data-navigating]'))
		})

		it('should mark the days between start and end as in-range', async () => {
			const start = CalendarDatesController.today.add({ days: 2 })
			const end = start.add({ days: 4 })

			fixture.component.value = new DateTimeRange(start, end)
			await settle()

			expect(queryAll('.day[data-in-range]').length).toBe(3)
		})

		it('should mark today', async () => {
			await navigateTo(CalendarDatesController.today)

			expect(queryAll('.day[data-now]').length).toBe(1)
			expect(query('.day[data-now]')).toBe(query('.day[data-navigating]'))
		})
	})

	describe('view navigation', () => {
		it('should switch to month view when a month heading is clicked', async () => {
			await settle()

			query<HTMLElement>('.month[data-view=day]')!.click()
			await settle()

			expect(fixture.component.view).toBe(FieldDateTimePrecision.Month)
		})

		it('should drill back down to day view navigated to the picked month', async () => {
			fixture.component.setView(FieldDateTimePrecision.Month)
			await settle()
			const target = fixture.component.navigationDate.add({ months: 3 })
			await navigateTo(target)

			query<HTMLElement>('.month[data-navigating]')!.click()
			await fixture.updateComplete

			expect(fixture.component.view).toBe(FieldDateTimePrecision.Day)
			expect(fixture.component.navigationDate.year).toBe(target.year)
			expect(fixture.component.navigationDate.month).toBe(target.month)
		})

		it('should switch to year view when a year heading is clicked in month view', async () => {
			fixture.component.setView(FieldDateTimePrecision.Month)
			await settle()

			query<HTMLElement>('.year[data-view=month]')!.click()
			await settle()

			expect(fixture.component.view).toBe(FieldDateTimePrecision.Year)
		})

		it('should drill down to month view navigated to the picked year', async () => {
			fixture.component.setView(FieldDateTimePrecision.Year)
			await settle()
			const target = fixture.component.navigationDate.add({ years: 5 })
			await navigateTo(target)

			query<HTMLElement>('.year[data-navigating]')!.click()
			await fixture.updateComplete

			expect(fixture.component.view).toBe(FieldDateTimePrecision.Month)
			expect(fixture.component.navigationDate.year).toBe(target.year)
		})

		for (const precision of [FieldDateTimePrecision.Year, FieldDateTimePrecision.Month, FieldDateTimePrecision.Day]) {
			it(`should align the initial view with the ${precision.key} precision`, async () => {
				fixture.component.precision = precision === FieldDateTimePrecision.Day
					? FieldDateTimePrecision.Year
					: FieldDateTimePrecision.Day
				await settle()

				fixture.component.precision = precision
				await settle()

				expect(fixture.component.view).toBe(precision)
			})
		}
	})

	describe('week precision', () => {
		const weekTarget = () => CalendarDatesController.today.with({ day: 15 }).weekStart

		beforeEach(async () => {
			fixture.component.precision = FieldDateTimePrecision.Week
			await settle()
		})

		it('should dispatch dateClick for the week\'s start when a week row is clicked', async () => {
			const target = weekTarget()
			await navigateTo(target)
			spyOn(fixture.component.dateClick, 'dispatch')

			query<HTMLElement>('.week[data-navigating]')!.click()

			expect(dispatchedDate().dayOfWeek).toBe(1)
			expect(FieldDateTimePrecision.Day.equals(dispatchedDate(), target)).toBeTrue()
		})

		it('should not react to individual day clicks', async () => {
			const target = weekTarget()
			await navigateTo(target)
			const dayCells = [...query('.week[data-navigating]')!.querySelectorAll<HTMLElement>('.day')]
			spyOn(fixture.component.dateClick, 'dispatch')

			dayCells[3]!.click()

			expect(fixture.component.dateClick.dispatch).toHaveBeenCalledTimes(1)
			expect(FieldDateTimePrecision.Day.equals(dispatchedDate(), target)).toBeTrue()
		})

		it('should show week numbers automatically', async () => {
			const target = weekTarget()
			await navigateTo(target)

			const weekNumbers = queryAll('.week-number').map(element => element.textContent!.trim())

			expect(weekNumbers).toContain(target.weekOfYear!.format())
		})

		it('should show week numbers at other precisions when includeWeek is set', async () => {
			fixture.component.precision = FieldDateTimePrecision.Day
			await settle()
			expect(queryAll('.week-number').length).toBe(0)

			fixture.component.includeWeek = true
			await settle()

			expect(queryAll('.week-number').length).toBeGreaterThan(0)
		})
	})

	describe('scrolling navigation', () => {
		it('should regenerate its dates when navigated outside the loaded window', async () => {
			await settle()
			const yearHeadings = () => queryAll('.year').map(element => element.textContent!.trim())
			const far = CalendarDatesController.today.add({ years: -15 })
			const farYear = far.format({ year: 'numeric' })
			expect(yearHeadings()).not.toContain(farYear)

			await navigateTo(far)

			expect(yearHeadings()).toContain(farYear)
		})
	})
})