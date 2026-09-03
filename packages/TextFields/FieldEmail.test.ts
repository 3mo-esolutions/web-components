import { ComponentTestFixture } from '@a11d/lit-testing'
import { Localizer } from '@3mo/localization'
import { type FieldEmail } from './FieldEmail.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import './index.js'

describe('FieldEmail', () => {
	const fixture = new ComponentTestFixture<FieldEmail>('mo-field-email')

	const language = Localizer.languages.current
	afterEach(() => Localizer.languages.current = language)

	it('should default its label to the localized "Email"', () => {
		expect(String(fixture.component.label)).toBe(String(t('Email')))

		// The label is captured by the class field initializer, so the language has to be switched before construction.
		Localizer.languages.current = 'de'
		expect(String(document.createElement('mo-field-email').label)).toBe('E-Mail')
	})

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
		it('should be type of email', () => expect(fixture.component.inputElement.getAttribute('type')).toBe('email'))
		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { value: 'Test', key: 'value' }))
	})

	describe('events', () => {
		it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
		it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))
	})

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})

	describe('validation', () => {
		it('should fail validation for a malformed email address and pass for a valid one', async () => {
			fixture.component.value = 'not-an-email'
			expect(await fixture.component.checkValidity()).toBe(false)

			fixture.component.value = 'someone@example.com'
			expect(await fixture.component.checkValidity()).toBe(true)
		})
	})
})