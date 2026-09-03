import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldToggleableDateTimeRange } from './FieldToggleableDateTimeRange.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import '@3mo/date-time'
import './index.js'

describe('FieldToggleableDateTimeRange', () => {
	const fixture = new ComponentTestFixture<FieldToggleableDateTimeRange>(
		html`<mo-field-toggleable-date-time-range open></mo-field-toggleable-date-time-range>`
	)

	const list = (tagName: string) => fixture.component.renderRoot.querySelector(tagName)

	it('should default the precision to day with time excluded', () => {
		expect(fixture.component.precision).toBe(FieldDateTimePrecision.Day)
		expect(fixture.component.includeTime).toBeFalse()
		expect(list('mo-hour-list')).toBeNull()
	})

	it('should raise the precision to minute and render time lists when includeTime is switched on', async () => {
		fixture.component.includeTime = true
		await fixture.updateComplete

		expect(fixture.component.precision).toBe(FieldDateTimePrecision.Minute)
		expect(list('mo-hour-list')).not.toBeNull()
		expect(list('mo-minute-list')).not.toBeNull()
	})

	it('should lower the precision back to day when includeTime is switched off', async () => {
		fixture.component.includeTime = true
		await fixture.updateComplete

		fixture.component.includeTime = false
		await fixture.updateComplete

		expect(fixture.component.precision).toBe(FieldDateTimePrecision.Day)
		expect(list('mo-hour-list')).toBeNull()
	})
})