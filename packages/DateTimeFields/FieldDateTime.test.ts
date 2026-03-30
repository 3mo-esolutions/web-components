import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldDateTime } from './FieldDateTime'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import '@3mo/date-time'

describe('FieldDateTime', () => {
	const fixture = new ComponentTestFixture<FieldDateTime>(html`<mo-field-date-time open precision='day'></mo-field-date-time>`)

	const getCalendar = () => fixture.component.renderRoot.querySelector('mo-calendar')!

	it('should be able to parse the precision enum class', () => {
		expect(fixture.component.precision).toEqual(FieldDateTimePrecision.Day)
	})

	it('should dispatch change event when a given date is selected in the calendar', () => {
		spyOn(fixture.component.change, 'dispatch')
		const date = new DateTime('2025-01-01')
		// @ts-expect-error Using UTC to avoid timezone issues in tests
		date.timeZone = 'UTC'
		getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: date }))
		expect(fixture.component.value).toEqual(date)
		expect(fixture.component.change.dispatch).toHaveBeenCalled()
	})

	describe('dateDisabled', () => {
		it('should pass dateDisabled to the calendar', async () => {
			const dateDisabled = (date: DateTime) => FieldDateTimePrecision.Day.equals(date, new DateTime('2025-06-15'))
			fixture.component.dateDisabled = dateDisabled
			await fixture.updateComplete
			expect(getCalendar().dateDisabled).toBe(dateDisabled)
		})
	})

	describe('min', () => {
		it('should pass min to the calendar', async () => {
			fixture.component.min = new DateTime('2025-06-15')
			await fixture.updateComplete
			expect(getCalendar().min).toEqual(fixture.component.min)
		})
	})

	describe('max', () => {
		it('should pass max to the calendar', async () => {
			fixture.component.max = new DateTime('2025-06-15')
			await fixture.updateComplete
			expect(getCalendar().max).toEqual(fixture.component.max)
		})
	})

	describe('attribute converters', () => {
		const fixtureWithAttributes = new ComponentTestFixture<FieldDateTime>(
			html`<mo-field-date-time open precision='day' min='2025-06-10' max='2025-06-20'></mo-field-date-time>`
		)

		it('should convert min string attribute to Date', () => {
			expect(fixtureWithAttributes.component.min).toBeInstanceOf(Date)
			expect(fixtureWithAttributes.component.min!.getFullYear()).toBe(2025)
			expect(fixtureWithAttributes.component.min!.getMonth()).toBe(5)
			expect(fixtureWithAttributes.component.min!.getDate()).toBe(10)
		})

		it('should convert max string attribute to Date', () => {
			expect(fixtureWithAttributes.component.max).toBeInstanceOf(Date)
			expect(fixtureWithAttributes.component.max!.getFullYear()).toBe(2025)
			expect(fixtureWithAttributes.component.max!.getMonth()).toBe(5)
			expect(fixtureWithAttributes.component.max!.getDate()).toBe(20)
		})

		it('should pass converted attributes to the calendar', () => {
			const calendar = fixtureWithAttributes.component.renderRoot.querySelector('mo-calendar')!
			expect(calendar.min).toEqual(fixtureWithAttributes.component.min)
			expect(calendar.max).toEqual(fixtureWithAttributes.component.max)
		})
	})
})