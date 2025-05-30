import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldDateTimeRange } from './FieldDateTimeRange'

describe('FieldDateTimeRange', () => {
	const fixture = new ComponentTestFixture<FieldDateTimeRange>(html`<mo-field-date-time-range open precision='day'></mo-field-date-time-range>`)

	it('should dispatch change event when a given date is selected in the calendar', () => {
		spyOn(fixture.component.change, 'dispatch')
		const calendar = fixture.component.renderRoot.querySelector('mo-calendar')!
		const date = new DateTime('2025-01-01')
		const dateRange = new DateTimeRange(date, undefined)

		calendar.dispatchEvent(new CustomEvent('dateClick', { detail: date }))

		expect(fixture.component.value).toEqual(dateRange)
		expect(fixture.component.change.dispatch).toHaveBeenCalledWith(dateRange)
	})
})