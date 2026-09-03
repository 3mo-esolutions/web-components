import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldTextArea } from './FieldTextArea.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import './index.js'

describe('FieldTextArea', () => {
	const fixture = new ComponentTestFixture<FieldTextArea>('mo-field-text-area')

	it('should render a textarea instead of an input', () => {
		expect(fixture.component.inputElement).toBeInstanceOf(HTMLTextAreaElement)
		expect(fixture.component.renderRoot.querySelector('input')).toBeNull()
	})

	describe('tunneling to the textarea', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { value: 'Test', key: 'value' }))

		it('should preserve a multiline value across the input round-trip', async () => {
			const multiline = 'first line\nsecond line'

			fixture.component.inputElement.value = multiline
			fixture.component.inputElement.dispatchEvent(new Event('change'))
			await fixture.updateComplete

			expect(fixture.component.value).toBe(multiline)
			expect(fixture.component.inputElement.value).toBe(multiline)
		})
	})

	describe('events', () => {
		it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
		it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))
	})

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})
})