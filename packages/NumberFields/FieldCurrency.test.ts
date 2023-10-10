import { ComponentTestFixture } from '@a11d/lit-testing'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from '../Field/InputFieldComponent.test.js'
import { expectSlotRendersOnlyWithAssignedContent } from '../Field/FieldComponent.test.js'
import { FieldCurrency } from './FieldCurrency.js'

describe('FieldCurrency', () => {
	const fixture = new ComponentTestFixture<FieldCurrency>('mo-field-currency')
	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
	it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
	it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { fieldValue: 4.999, inputValue: '5.00', key: 'value' }))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', '4', 4))
	it('should proxy change event', async () => {
		expectInputEventTunnelsToField(fixture, 'change', '5', 5)
		await fixture.updateComplete
		expect(fixture.component.inputElement.value).toBe('5.00')
	})
})