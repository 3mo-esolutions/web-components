import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldTextArea } from './FieldTextArea.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from '../Field/InputFieldComponent.test.js'
import { expectSlotRendersOnlyWithAssignedContent } from '../Field/FieldComponent.test.js'

describe('FieldTextArea', () => {
	const fixture = new ComponentTestFixture<FieldTextArea>('mo-field-text-area')
	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
	it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { value: 'Test', key: 'value' }))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
	it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))
	it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
	it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
})