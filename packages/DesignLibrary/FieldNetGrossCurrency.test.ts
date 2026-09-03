import { ComponentTestFixture } from '@a11d/lit-testing'
import { Currency } from '@3mo/localization'
import { expectFieldPropertyTunnelsToInput } from '../Field/InputFieldComponent.test.js'
import { type FieldNetGrossCurrency } from './FieldNetGrossCurrency.js'

describe('FieldNetGrossCurrency', () => {
	const fixture = new ComponentTestFixture<FieldNetGrossCurrency>('mo-field-net-gross-currency')

	const button = (label: 'N' | 'B') => [...fixture.component.renderRoot.querySelectorAll('button')]
		.find(button => button.textContent?.trim() === label)!
	const symbolElement = () => fixture.component.renderRoot.querySelector('mo-flex[slot=end] > div')!

	const spyOnChange = () => {
		const change = jasmine.createSpy('change')
		fixture.component.addEventListener<any>('change', (e: CustomEvent<NetGrossCurrency>) => change(e.detail))
		return change
	}

	it('should tunnel disabled, readonly and required to its own input template (disabled)',
		() => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
	it('should tunnel disabled, readonly and required to its own input template (readonly)',
		() => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
	it('should tunnel disabled, readonly and required to its own input template (required)',
		() => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))

	describe('value', () => {
		it('should format the amount as currency in the input', async () => {
			fixture.component.value = [1234.5, false]

			await fixture.updateComplete

			expect(fixture.component.inputElement.value).toBe((1234.5).formatAsCurrency(undefined))
		})

		it('should adopt the gross flag from an assigned value tuple', async () => {
			expect(fixture.component.isGross).toBeFalse()

			fixture.component.value = [50, true]
			await fixture.updateComplete

			expect(fixture.component.isGross).toBeTrue()
		})

		for (const [description, text, amount] of [
			['localized', (1234.5).formatAsCurrency(undefined), 1234.5],
			['empty', '', undefined],
		] as const) {
			it(`should parse the typed text into the amount of the dispatched value tuple (${description})`, () => {
				const change = spyOnChange()

				fixture.component.inputElement.value = text
				fixture.component.inputElement.dispatchEvent(new Event('change'))

				expect(change).toHaveBeenCalledTimes(1)
				expect(change.calls.mostRecent().args[0][0]).toBe(amount)
			})
		}
	})

	describe('net/gross switcher', () => {
		it('should mark the button of the active side as selected', async () => {
			expect(button('N').hasAttribute('data-selected')).toBeTrue()
			expect(button('B').hasAttribute('data-selected')).toBeFalse()

			fixture.component.value = [100, true]
			await fixture.updateComplete

			expect(button('N').hasAttribute('data-selected')).toBeFalse()
			expect(button('B').hasAttribute('data-selected')).toBeTrue()
		})

		for (const [side, isGross] of [['B', false], ['N', true]] as const) {
			it(`should dispatch a change event carrying the current amount when the other button is clicked (${side})`, async () => {
				fixture.component.value = [100, isGross]
				await fixture.updateComplete
				const change = spyOnChange()

				button(side).click()

				expect(change).toHaveBeenCalledTimes(1)
				expect(change.calls.mostRecent().args[0][0]).toBe(100)
			})
		}

		it('should not dispatch a change event when the already-selected side is clicked', async () => {
			fixture.component.value = [100, false]
			await fixture.updateComplete
			const change = spyOnChange()

			button('N').click()

			expect(change).not.toHaveBeenCalled()
		})
	})

	describe('currency', () => {
		it('should display the currency\'s symbol, defaulting to EUR', () => {
			expect(fixture.component.currency.code).toBe('EUR')
			expect(symbolElement().textContent?.trim()).toBe(Currency.EUR.symbol)
		})

		it('should prefer the currencySymbol property over the currency\'s own symbol', async () => {
			fixture.component.currency = Currency.USD
			fixture.component.currencySymbol = 'CHF'

			await fixture.updateComplete

			expect(symbolElement().textContent?.trim()).toBe('CHF')
		})
	})
})