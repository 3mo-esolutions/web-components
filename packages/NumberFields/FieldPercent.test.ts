import { ComponentTestFixture } from '@a11d/lit-testing'
import { Localizer } from '@3mo/localization'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import { type FieldPercent } from './FieldPercent.js'
import './index.js'

describe('FieldPercent', () => {
	const fixture = new ComponentTestFixture<FieldPercent>('mo-field-percent')

	const asPercent = (value: number) => value.format({ useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 2 })
	const signElement = () => fixture.component.renderRoot.querySelector<HTMLElement>('span[slot=end]')!

	const commit = async (value: number) => {
		fixture.component.inputElement.value = value.format(Localizer.languages.current, { useGrouping: true })
		fixture.component.inputElement.dispatchEvent(new Event('change'))
		await fixture.updateComplete
	}

	describe('tunneling to the input', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { fieldValue: 4.999, inputValue: asPercent(4.999), key: 'value' }))
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
		it('should reformat the committed value to at most two fraction digits without grouping on change', async () => {
			await commit(4.467)

			expect(fixture.component.value).toBe(4.467)
			expect(fixture.component.inputElement.value).toBe(asPercent(4.467))
		})
	})

	describe('percent sign', () => {
		it('should render "%" in the end slot by default', () => {
			expect(fixture.component.percentSign).toBe('%')
			expect(signElement().textContent?.trim()).toBe('%')
		})

		it('should render a custom percentSign', async () => {
			fixture.component.percentSign = '‰'
			await fixture.updateComplete

			expect(signElement().textContent?.trim()).toBe('‰')
		})

		it('should focus the input when the sign is clicked', () => {
			spyOn(fixture.component, 'focus')

			signElement().click()

			expect(fixture.component.focus).toHaveBeenCalled()
		})
	})

	describe('range', () => {
		it('should clamp the committed value into the default range of 0 to 100', async () => {
			expect(fixture.component.min).toBe(0)
			expect(fixture.component.max).toBe(100)

			await commit(150)
			expect(fixture.component.value).toBe(100)
			expect(fixture.component.inputElement.value).toBe(asPercent(100))

			await commit(-5)
			expect(fixture.component.value).toBe(0)
			expect(fixture.component.inputElement.value).toBe(asPercent(0))
		})
	})
})