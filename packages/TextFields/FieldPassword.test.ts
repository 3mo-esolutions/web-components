import { ComponentTestFixture } from '@a11d/lit-testing'
import { Localizer } from '@3mo/localization'
import { type FieldPassword } from './FieldPassword.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import './index.js'
import '@3mo/icon-button'

describe('FieldPassword', () => {
	const fixture = new ComponentTestFixture<FieldPassword>('mo-field-password')

	const revealIconButton = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-icon-button[slot=end]')!

	const language = Localizer.languages.current
	afterEach(() => Localizer.languages.current = language)

	it('should default its label to the localized "Password"', () => {
		expect(String(fixture.component.label)).toBe(String(t('Password')))

		// The label is captured by the class field initializer, so the language has to be switched before construction.
		Localizer.languages.current = 'de'
		expect(String(document.createElement('mo-field-password').label)).toBe('Passwort')
	})

	it('should default autoComplete to "current-password"', () => {
		expect(fixture.component.autoComplete).toBe('current-password')
		expect(fixture.component.inputElement.getAttribute('autocomplete')).toBe('current-password')
	})

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
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

	describe('reveal', () => {
		it('should render a password-type input by default', () => {
			expect(fixture.component.reveal).toBeFalse()
			expect(fixture.component.inputElement.type).toBe('password')
		})

		it('should switch the input to type "text" while reveal is on', async () => {
			fixture.component.reveal = true
			await fixture.updateComplete

			expect(fixture.component.inputElement.type).toBe('text')
		})

		it('should toggle reveal when the visibility icon-button is clicked', async () => {
			revealIconButton().click()
			await fixture.updateComplete

			expect(fixture.component.reveal).toBeTrue()

			revealIconButton().click()
			await fixture.updateComplete

			expect(fixture.component.reveal).toBeFalse()
		})

		it('should reflect the reveal state in the icon-button\'s icon and title', async () => {
			expect(revealIconButton().getAttribute('icon')).toBe('visibility')
			expect(revealIconButton().getAttribute('title')).toBe(String(t('Reveal')))

			fixture.component.reveal = true
			await fixture.updateComplete

			expect(revealIconButton().getAttribute('icon')).toBe('visibility_off')
			expect(revealIconButton().getAttribute('title')).toBe(String(t('Hide')))
		})
	})

	it('should not render the remaining-length indicator even when maxLength is set', async () => {
		fixture.component.maxLength = 10
		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('span[slot=end]')).toBeNull()
	})
})