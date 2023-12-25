import { component, Component } from '@a11d/lit'
import { disabledProperty } from './disabledProperty.js'
import { ComponentTestFixture } from '@a11d/lit-testing'

describe('disabledProperty', () => {
	@component('test-disabled-property')
	class TestComponent extends Component {
		@disabledProperty() disabled?: boolean
	}

	const baseFixture = new ComponentTestFixture(() => new TestComponent)

	it('sets up the "disabled" property which reflects to the "disabled" attribute', async () => {
		expect(baseFixture.component.hasAttribute('disabled')).toBe(false)
		expect(baseFixture.component.hasAttribute('aria-disabled')).toBe(false)

		baseFixture.component.disabled = true
		await baseFixture.updateComplete

		expect(baseFixture.component.disabled).toBe(true)
		expect(baseFixture.component.hasAttribute('disabled')).toBe(true)
		expect(baseFixture.component.getAttribute('aria-disabled')).toBe('true')
	})

	describe('blockFocus', () => {
		@component('mo-test-disabled-property-block-focus')
		class TestComponentBlockFocus extends Component {
			@disabledProperty({ blockFocus: true }) disabled?: boolean
		}

		const blockFocusFixture = new ComponentTestFixture(() => new TestComponentBlockFocus)

		it('"blockFocus" option prevents focus when disabled', async () => {
			const setDisabled = async (disabled: boolean) => {
				blockFocusFixture.component.disabled = disabled
				await blockFocusFixture.updateComplete
				baseFixture.component.disabled = disabled
				await baseFixture.updateComplete
			}

			blockFocusFixture.component.tabIndex = 5
			baseFixture.component.tabIndex = 5

			await setDisabled(true)
			expect(blockFocusFixture.component.tabIndex).toBe(-1)
			expect(baseFixture.component.tabIndex).toBe(5)

			await setDisabled(false)
			expect(blockFocusFixture.component.tabIndex).toBe(5)
			expect(baseFixture.component.tabIndex).toBe(5)
		})
	})
})