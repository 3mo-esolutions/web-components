import { ComponentTestFixture } from '@a11d/lit-testing'
import { Currency, Localizer } from '@3mo/localization'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import { FieldCurrency } from './FieldCurrency.js'
import './index.js'

describe('FieldCurrency', () => {
	const fixture = new ComponentTestFixture<FieldCurrency>('mo-field-currency')

	const symbolElement = () => fixture.component.renderRoot.querySelector<HTMLElement>('span[slot=end]')!

	const defaultCurrency = FieldCurrency.defaultCurrency
	afterEach(() => FieldCurrency.defaultCurrency = defaultCurrency)

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { fieldValue: 5, inputValue: (5).formatAsCurrency(undefined), key: 'value' }))
	})

	describe('events', () => {
		it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', '4', 4))
		it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', '5', 5))
	})

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})

	describe('formatting', () => {
		it('should reformat the committed value with two fraction digits on change', async () => {
			fixture.component.currency = Currency.EUR
			await fixture.updateComplete

			fixture.component.inputElement.value = (1234.5).format(Localizer.languages.current, { useGrouping: true })
			fixture.component.inputElement.dispatchEvent(new Event('change'))
			await fixture.updateComplete

			expect(fixture.component.value).toBe(1234.5)
			// Pinned deviation: `format` calls `formatAsCurrency(undefined)`, so the assigned currency does not take part in formatting.
			expect(fixture.component.inputElement.value).toBe((1234.5).formatAsCurrency(undefined))
		})
	})

	describe('currency', () => {
		it('should render the currency\'s symbol in the end slot', async () => {
			fixture.component.currency = Currency.EUR
			await fixture.updateComplete

			expect(symbolElement().textContent?.trim()).toBe(Currency.EUR.symbol)
		})

		it('should update the symbol when the currency changes', async () => {
			fixture.component.currency = Currency.EUR
			await fixture.updateComplete
			expect(symbolElement().textContent?.trim()).toBe(Currency.EUR.symbol)

			fixture.component.currency = Currency.USD
			await fixture.updateComplete

			expect(symbolElement().textContent?.trim()).toBe(Currency.USD.symbol)
		})

		it('should convert a currency-code attribute into a Currency instance', async () => {
			fixture.component.setAttribute('currency', 'usd')
			await fixture.updateComplete

			expect(fixture.component.currency).toBeInstanceOf(Currency)
			expect(fixture.component.currency?.code).toBe('USD')
		})

		it('should fall back to FieldCurrency.defaultCurrency when no currency is set', () => {
			expect(fixture.component.currency).toBe(defaultCurrency)

			FieldCurrency.defaultCurrency = Currency.GBP

			expect(document.createElement('mo-field-currency').currency?.code).toBe('GBP')
		})

		it('should focus the input when the symbol is clicked', () => {
			spyOn(fixture.component, 'focus')

			symbolElement().click()

			expect(fixture.component.focus).toHaveBeenCalled()
		})
	})
})