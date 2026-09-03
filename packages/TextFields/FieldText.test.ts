import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldText } from './FieldText.js'
import { expectSlotRendersOnlyWithAssignedContent, expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from '../Field/InputFieldComponent.test.js'
import './index.js'

describe('FieldText', () => {
	const fixture = new ComponentTestFixture<FieldText>('mo-field-text')

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { value: 'Test', key: 'value' }))

		const attributes = [
			{ property: 'minLength', attribute: 'minlength', value: 4, expected: '4' },
			{ property: 'maxLength', attribute: 'maxlength', value: 8, expected: '8' },
			{ property: 'pattern', attribute: 'pattern', value: '[a-z]+', expected: '[a-z]+' },
			{ property: 'autoComplete', attribute: 'autocomplete', value: 'username', expected: 'username' },
		] as const

		for (const { property, attribute, value, expected } of attributes) {
			it(`should tunnel ${property} as the "${attribute}" input attribute`, async () => {
				expect(fixture.component.inputElement.getAttribute(attribute)).toBeNull()

				Object.assign(fixture.component, { [property]: value })
				await fixture.updateComplete

				expect(fixture.component.inputElement.getAttribute(attribute)).toBe(expected)
			})
		}

		it('should render a text input with inputmode "text"', () => {
			expect(fixture.component.inputElement).toBeInstanceOf(HTMLInputElement)
			expect(fixture.component.inputElement.getAttribute('type')).toBe('text')
			expect(fixture.component.inputElement.getAttribute('inputmode')).toBe('text')
		})
	})

	describe('events', () => {
		it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
		it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))

		it('should not dispatch input or change when the value is assigned programmatically', async () => {
			const input = jasmine.createSpy('input')
			const change = jasmine.createSpy('change')
			fixture.component.addEventListener('input', input)
			fixture.component.addEventListener('change', change)

			fixture.component.value = 'Programmatic'
			await fixture.updateComplete

			expect(fixture.component.inputElement.value).toBe('Programmatic')
			expect(input).not.toHaveBeenCalled()
			expect(change).not.toHaveBeenCalled()
		})
	})

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})

	describe('remaining-length indicator', () => {
		const indicator = () => fixture.component.renderRoot.querySelector('span[slot=end]')

		it('should not render an indicator without maxLength', () => {
			expect(indicator()).toBeNull()
		})

		it('should render the remaining length and update it as the user types', async () => {
			fixture.component.maxLength = 10
			await fixture.updateComplete

			expect(indicator()?.textContent?.trim()).toBe('10')

			fixture.component.inputElement.value = 'abcd'
			fixture.component.inputElement.dispatchEvent(new Event('input'))
			await fixture.updateComplete

			expect(indicator()?.textContent?.trim()).toBe('6')
		})
	})

	describe('validation', () => {
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

		it('should fail validation when the value does not match the pattern', async () => {
			fixture.component.pattern = '[0-9]+'

			fixture.component.value = 'abc'
			expect(await fixture.component.checkValidity()).toBe(false)

			fixture.component.value = '123'
			expect(await fixture.component.checkValidity()).toBe(true)
		})

		it('should fail validation after setCustomValidity until it is cleared', async () => {
			fixture.component.value = 'Test'
			fixture.component.setCustomValidity('Not allowed')
			expect(await fixture.component.checkValidity()).toBe(false)

			fixture.component.setCustomValidity('')
			expect(await fixture.component.checkValidity()).toBe(true)
		})
	})
})