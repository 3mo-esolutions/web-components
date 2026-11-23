import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { userEvent } from 'vitest/browser'
import { type FieldDate } from './FieldDate.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import '../index.js'

describe('FieldDate', () => {
	const fixture = new ComponentTestFixture<FieldDate>(html`
		<mo-field-date></mo-field-date>
	`)

	it('should default precision to Day', () => {
		expect(fixture.component.precision).toBe(FieldDateTimePrecision.Day)
	})

	describe('clear button', () => {
		const fixture = new ComponentTestFixture<FieldDate>(html`
			<mo-field-date label='Due' style='width: fit-content' .value=${new Date(2026, 10, 23)}></mo-field-date>
		`)

		const button = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-icon-button[icon=cancel]')!

		it('should show only while the field is focused with a value, without widening the field', async () => {
			const width = fixture.component.getBoundingClientRect().width
			expect(getComputedStyle(button()).visibility).toBe('hidden')

			await userEvent.click(fixture.component.renderRoot.querySelector('[part=segment]')!)
			await fixture.updateComplete

			expect(getComputedStyle(button()).visibility).toBe('visible')
			expect(fixture.component.getBoundingClientRect().width).toBe(width)
		})
	})
})
