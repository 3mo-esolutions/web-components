import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { FieldNumber } from './FieldNumber.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from './InputFieldComponent.test.js'

describe('FieldNumber', () => {
	const fixture = new ComponentTestFixture<FieldNumber>('mo-field-number')
	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, true, 'disabled'))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, true, 'readonly', 'readOnly'))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, true, 'required'))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', '4', 4))
	it('should proxy change event', () => {
		expectInputEventTunnelsToField(fixture, 'change', '5', 5)
	})
})