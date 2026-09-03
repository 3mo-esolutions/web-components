import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldTime } from './FieldTime.js'

describe('FieldTime', () => {
	const fixture = new ComponentTestFixture<FieldTime>(html`
		<mo-field-time></mo-field-time>
	`)

	it('should set inputType to time', () => {
		expect(fixture.component.inputType).toBe('time')
	})
})