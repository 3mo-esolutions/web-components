import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldDateTime } from './FieldDateTime'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

describe('FieldDateTime', () => {
	const fixture = new ComponentTestFixture<FieldDateTime>(html`<mo-field-date-time open precision='day'></mo-field-date-time>`)

	it('should be able to parse the precision enum class', () => {
		expect(fixture.component.precision).toEqual(FieldDateTimePrecision.Day)
	})

	it('should dispatch change event when a given date is selected in the calendar', () => {
		spyOn(fixture.component.change, 'dispatch')
		const calendar = fixture.component.renderRoot.querySelector('mo-calendar')!
		const date = new DateTime('2025-01-01')

		calendar.dispatchEvent(new CustomEvent('dateClick', { detail: date }))

		expect(fixture.component.value).toEqual(date)
		expect(fixture.component.change.dispatch).toHaveBeenCalledWith(date)
	})
})