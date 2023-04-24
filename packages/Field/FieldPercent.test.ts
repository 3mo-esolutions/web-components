import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { FieldPercent } from './FieldPercent.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from './InputFieldComponent.test.js'

describe('FieldPercent', () => {
	const fixture = new ComponentTestFixture<FieldPercent>('mo-field-percent')
	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, true, 'disabled'))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, true, 'readonly', 'readOnly'))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, true, 'required'))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', '4', 4))
	it('should proxy change event', async () => {
		expectInputEventTunnelsToField(fixture, 'change', '4.467', 4.467)
		await fixture.updateComplete
		expect(fixture.component.inputElement.value).toBe('4.47')
	})
})