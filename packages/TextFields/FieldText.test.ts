import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldText } from './FieldText.js'
import { expectSlotRendersOnlyWithAssignedContent } from '../Field/FieldComponent.test.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from '../Field/InputFieldComponent.test.js'

describe('FieldText', () => {
	const fixture = new ComponentTestFixture<FieldText>('mo-field-text')

	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
	it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { value: 'Test', key: 'value' }))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
	it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))
	it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
	it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))

	it('should fail validation if the value is empty and required', async () => {
		fixture.component.required = true
		expect(await fixture.component.checkValidity()).toBe(false)

		fixture.component.value = ''
		expect(await fixture.component.checkValidity()).toBe(false)


		fixture.component.value = 'Test'
		expect(await fixture.component.checkValidity()).toBe(true)
	})

	it('should fail validation if the value is too short or too long', async () => {
		fixture.component.minLength = 3
		fixture.component.maxLength = 5

		fixture.component.value = 'Te'
		expect(await fixture.component.checkValidity()).toBe(false)

		fixture.component.value = 'Test'
		expect(await fixture.component.checkValidity()).toBe(true)

		fixture.component.value = 'TestTest'
		expect(await fixture.component.checkValidity()).toBe(false)
	})
})