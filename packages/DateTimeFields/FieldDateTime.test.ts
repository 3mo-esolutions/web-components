import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldDateTime } from './FieldDateTime'

describe('FieldDateTime', () => {
	const fixture = new ComponentTestFixture<FieldDateTime>(html`<mo-field-date-time open></mo-field-date-time>`)

	it('should dispatch change event when a given date is selected in the calendar', () => {
		spyOn(fixture.component.change, 'dispatch')
		const calendar = fixture.component.renderRoot.querySelector('mo-selectable-calendar')!
		const date = new DateTime('2025-01-01')

		calendar.dispatchEvent(new CustomEvent('change', { detail: date }))

		expect(fixture.component.value).toEqual(date)
		expect(fixture.component.change.dispatch).toHaveBeenCalledWith(date)
	})
})