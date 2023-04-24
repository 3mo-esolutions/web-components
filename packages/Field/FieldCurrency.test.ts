import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { FieldCurrency } from './FieldCurrency.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from './InputFieldComponent.test.js'

describe('FieldCurrency', () => {
	const fixture = new ComponentTestFixture<FieldCurrency>('mo-field-currency')
	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, true, 'disabled'))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, true, 'readonly', 'readOnly'))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, true, 'required'))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', '4', 4))
	it('should proxy change event', async () => {
		expectInputEventTunnelsToField(fixture, 'change', '5', 5)
		await fixture.updateComplete
		expect(fixture.component.inputElement.value).toBe('5.00')
	})
})