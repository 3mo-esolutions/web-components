import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LanguageCode, Localizer } from '@3mo/localization'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import { type FieldNumber } from './FieldNumber.js'
import './index.js'

describe('FieldNumber', () => {
	const fixture = new ComponentTestFixture<FieldNumber>('mo-field-number')

	const languages: Array<LanguageCode> = ['en', 'de', 'fa']

	const language = Localizer.languages.current
	afterEach(() => Localizer.languages.current = language)

	const commit = async (inputValue: string) => {
		fixture.component.inputElement.value = inputValue
		fixture.component.inputElement.dispatchEvent(new Event('change'))
		await fixture.updateComplete
	}

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))

		it('should render a text input with inputmode "decimal" and autocomplete "off"', () => {
			expect(fixture.component.inputElement.getAttribute('type')).toBe('text')
			expect(fixture.component.inputElement.getAttribute('inputmode')).toBe('decimal')
			expect(fixture.component.inputElement.getAttribute('autocomplete')).toBe('off')
		})

		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { fieldValue: 4.999, inputValue: (4.999).format(), key: 'value' }))

		for (const { property, value } of [{ property: 'min', value: 1 }, { property: 'max', value: 9 }, { property: 'step', value: 0.5 }] as const) {
			it(`should tunnel ${property} as an input attribute`, async () => {
				expect(fixture.component.inputElement.getAttribute(property)).toBeNull()

				Object.assign(fixture.component, { [property]: value })
				await fixture.updateComplete

				expect(fixture.component.inputElement.getAttribute(property)).toBe(String(value))
			})
		}
	})

	for (const { property, value } of [{ property: 'value', value: 5 }, { property: 'min', value: 0 }, { property: 'max', value: 100 }, { property: 'step', value: 0.5 }] as const) {
		it(`should reflect ${property} as a host attribute`, async () => {
			expect(fixture.component.hasAttribute(property)).toBeFalse()

			Object.assign(fixture.component, { [property]: value })
			await fixture.updateComplete

			expect(fixture.component.getAttribute(property)).toBe(String(value))
		})
	}

	describe('events', () => {
		it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', '4', 4))
		it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', '5', 5))

		it('should not dispatch input or change when the value is assigned programmatically', async () => {
			const input = jasmine.createSpy('input')
			const change = jasmine.createSpy('change')
			fixture.component.addEventListener('input', input)
			fixture.component.addEventListener('change', change)

			fixture.component.value = 42
			await fixture.updateComplete

			expect(fixture.component.inputElement.value).toBe((42).format())
			expect(input).not.toHaveBeenCalled()
			expect(change).not.toHaveBeenCalled()
		})
	})

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})

	describe('localized parsing', () => {
		for (const localizedLanguage of languages) {
			it(`should parse the localized input string into a number on change in "${localizedLanguage}"`, async () => {
				Localizer.languages.current = localizedLanguage
				const change = jasmine.createSpy('change')
				fixture.component.addEventListener('change', (e: Event) => change((e as CustomEvent<number | undefined>).detail))

				await commit((1234.56).format(localizedLanguage, { useGrouping: true }))

				expect(change).toHaveBeenCalledOnceWith(1234.56)
				expect(fixture.component.value).toBe(1234.56)
			})
		}

		it('should dispatch undefined for an empty or unparseable input', async () => {
			spyOn(fixture.component.change, 'dispatch')

			await commit('')
			expect(fixture.component.change.dispatch).toHaveBeenCalledOnceWith(undefined)

			await commit('not a number')
			expect(fixture.component.change.dispatch).toHaveBeenCalledTimes(2)
			expect(fixture.component.value).toBeUndefined()
		})
	})

	describe('localized formatting', () => {
		for (const localizedLanguage of ['de', 'fa'] as Array<LanguageCode>) {
			it(`should reformat the input to the localized string on change in "${localizedLanguage}"`, async () => {
				Localizer.languages.current = localizedLanguage

				await commit((1234.56).format(localizedLanguage, { useGrouping: true }))

				expect(fixture.component.value).toBe(1234.56)
				expect(fixture.component.inputElement.value).toBe((1234.56).format(localizedLanguage))
			})
		}

		it('should not reformat the displayed string while typing', async () => {
			const typed = (1234.56).format(Localizer.languages.current, { useGrouping: true })
			const input = jasmine.createSpy('input')
			fixture.component.addEventListener('input', (e: Event) => input((e as CustomEvent<number | undefined>).detail))

			fixture.component.inputElement.value = typed
			fixture.component.inputElement.dispatchEvent(new Event('input'))
			await fixture.updateComplete

			expect(input).toHaveBeenCalledOnceWith(1234.56)
			expect(fixture.component.inputElement.value).toBe(typed)
		})

		it('should format a programmatically assigned value into the input', async () => {
			fixture.component.value = 1234.56
			await fixture.updateComplete

			expect(fixture.component.inputElement.value).toBe((1234.56).format())
		})
	})

	describe('min/max clamping', () => {
		beforeEach(async () => {
			fixture.component.min = 0
			fixture.component.max = 100
			await fixture.updateComplete
		})

		it('should clamp the committed value into [min, max] on change and display the clamped value', async () => {
			await commit((150).format())

			expect(fixture.component.value).toBe(100)
			expect(fixture.component.inputElement.value).toBe((100).format())

			await commit((-20).format())

			expect(fixture.component.value).toBe(0)
			expect(fixture.component.inputElement.value).toBe((0).format())
		})

		it('should not clamp while typing, so input dispatches the raw number', async () => {
			const input = jasmine.createSpy('input')
			fixture.component.addEventListener('input', (e: Event) => input((e as CustomEvent<number | undefined>).detail))

			fixture.component.inputElement.value = (150).format()
			fixture.component.inputElement.dispatchEvent(new Event('input'))
			await fixture.updateComplete

			expect(input).toHaveBeenCalledOnceWith(150)
			expect(fixture.component.value).toBeUndefined()
		})
	})

	describe('selectOnFocus', () => {
		it('should select the whole input text on focus', async () => {
			expect(fixture.component.selectOnFocus).toBeTrue()
			fixture.component.value = 1234.56
			await fixture.updateComplete

			fixture.component.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
			await new Promise<void>(resolve => setTimeout(resolve))

			expect(fixture.component.inputElement.selectionStart).toBe(0)
			expect(fixture.component.inputElement.selectionEnd).toBe(fixture.component.inputElement.value.length)
		})
	})
})