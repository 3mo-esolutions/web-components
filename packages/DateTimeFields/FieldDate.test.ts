import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldDate } from './FieldDate.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

describe('FieldDate', () => {
	const fixture = new ComponentTestFixture<FieldDate>(html`
		<mo-field-date></mo-field-date>
	`)

	it('should default precision to Day', () => {
		expect(fixture.component.precision).toBe(FieldDateTimePrecision.Day)
	})
})