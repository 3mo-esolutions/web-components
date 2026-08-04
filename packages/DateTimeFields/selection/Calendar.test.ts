import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Localizer } from '@3mo/localization'
import type { Calendar } from './Calendar.js'
import { CalendarDatesController } from './CalendarDatesController.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import '@3mo/date-time'

describe('Calendar', () => {
	// `precision` is an object property, so it has to be bound rather than set as an attribute.
	const fixture = new ComponentTestFixture<Calendar>(html`<mo-calendar .precision=${FieldDateTimePrecision.Day}></mo-calendar>`)

	const language = Localizer.languages.current

	afterEach(async () => {
		Localizer.languages.current = language
		await new Promise<void>(resolve => queueMicrotask(() => resolve()))
		await fixture.updateComplete
	})

	const switchTo = async (next: typeof language) => {
		Localizer.languages.current = next
		// The controller defers invalidation by a microtask so that DateTime clears its cache first.
		await new Promise<void>(resolve => queueMicrotask(() => resolve()))
		await fixture.updateComplete
	}

	// Regression: DateTime freezes its calendar at construction and the controller only regenerated
	// dates when the navigation date left a +/-75 day window. Switching language therefore re-formatted
	// the existing Gregorian grid with Persian digits instead of rebuilding it as a Persian calendar,
	// and only a page reload produced the right grid.
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

	// Regression: the sample week was built once in a static initialiser, so the weekday header kept
	// the calendar and week length of whichever language happened to load first.
	it('should rebuild the sample week on the calendar of the new language', async () => {
		await switchTo('en')
		expect(CalendarDatesController.sampleWeek.every(d => d.calendarId === 'gregory')).toBeTrue()

		await switchTo('fa')
		expect(CalendarDatesController.sampleWeek.every(d => d.calendarId === 'persian')).toBeTrue()
	})

	// Regression: `today` was memoized for 60 seconds with no way to invalidate it, so it stayed on
	// the outgoing calendar for up to a minute after the switch.
	it('should rebuild today on the calendar of the new language', async () => {
		await switchTo('en')
		expect(CalendarDatesController.today.calendarId).toBe('gregory')

		await switchTo('fa')
		expect(CalendarDatesController.today.calendarId).toBe('persian')
	})
})