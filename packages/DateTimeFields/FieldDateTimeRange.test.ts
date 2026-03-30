import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldDateTimeRange } from './FieldDateTimeRange'

describe('FieldDateTimeRange', () => {
	const fixture = new ComponentTestFixture<FieldDateTimeRange>(html`<mo-field-date-time-range open precision='day'></mo-field-date-time-range>`)

	const getCalendar = () => fixture.component.renderRoot.querySelector('mo-calendar')!

	it('should dispatch change event when a given date is selected in the calendar', () => {
		spyOn(fixture.component.change, 'dispatch')
		const date = new DateTime('2025-01-01')
		// @ts-expect-error Using UTC to avoid timezone issues in tests
		date.timeZone = 'UTC'
		getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: date }))
		expect(fixture.component.value).toEqual(new DateTimeRange(date, undefined))
		expect(fixture.component.change.dispatch).toHaveBeenCalled()
	})

	describe('dateDisabled', () => {
		it('should pass dateDisabled to the calendar', async () => {
			const dateDisabled = (date: DateTime) => date.getDate() === 15
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
})