import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldDateRange } from './FieldDateRange.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

describe('FieldDateRange', () => {
	const fixture = new ComponentTestFixture<FieldDateRange>(html`
		<mo-field-date-range></mo-field-date-range>
	`)

	it('should default precision to Day', () => {
		expect(fixture.component.precision).toBe(FieldDateTimePrecision.Day)
	})
})