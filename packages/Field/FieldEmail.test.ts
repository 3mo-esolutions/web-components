import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { FieldEmail } from './FieldEmail.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from './InputFieldComponent.test.js'

describe('FieldEmail', () => {
	const fixture = new ComponentTestFixture<FieldEmail>('mo-field-email')
	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should be type of email', () => expect(fixture.component.inputElement.getAttribute('type')).toBe('email'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, true, 'disabled'))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, true, 'readonly', 'readOnly'))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, true, 'required'))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
	it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))
})