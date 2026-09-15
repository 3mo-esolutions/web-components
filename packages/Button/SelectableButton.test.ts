import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { ButtonType } from './Button.js'
import { type SelectableButton } from './SelectableButton.js'
import './index.js'
import '@3mo/selection-group'

describe('SelectableButton', () => {
	describe('on its own', () => {
		const fixture = new ComponentTestFixture<SelectableButton>(html`<mo-selectable-button value='cash'>Cash</mo-selectable-button>`)

		it('should be a mo-button, with the button\'s own default type', () => {
			expect(fixture.component.type).toBe(ButtonType.Text)
			expect(fixture.component.renderRoot.querySelector('md-text-button')).not.toBeNull()
		})

		it('should announce itself as an unpressed toggle', () => {
			expect(fixture.component.getAttribute('role')).toBe('button')
			expect(fixture.component.getAttribute('aria-pressed')).toBe('false')
			expect(fixture.component.hasAttribute('aria-checked')).toBe(false)
		})

		it('should toggle and dispatch change when clicked, since nothing else owns the answer', async () => {
			const states = new Array<boolean>()
			fixture.component.addEventListener('change', (e: Event) => states.push((e as CustomEvent<boolean>).detail))

			fixture.component.click()
			await fixture.updateComplete
			expect(fixture.component.selected).toBe(true)
			expect(fixture.component.getAttribute('aria-pressed')).toBe('true')

			fixture.component.click()
			await fixture.updateComplete

			expect(states).toEqual([true, false])
		})

		it('should ask before it answers, and do nothing when refused', async () => {
			const changes = jasmine.createSpy('change')
			fixture.component.addEventListener('change', changes)
			fixture.component.addEventListener('requestSelect', (e: Event) => e.preventDefault())

			fixture.component.click()
			await fixture.updateComplete

			expect(fixture.component.selected).toBe(false)
			expect(changes).not.toHaveBeenCalled()
		})

		it('should carry the state it would take in the request', () => {
			const states = new Array<boolean>()
			fixture.component.addEventListener('requestSelect', (e: Event) => states.push((e as CustomEvent<boolean>).detail))

			fixture.component.click()

			expect(states).toEqual([true])
		})
	})

	describe('disabled', () => {
		const fixture = new ComponentTestFixture<SelectableButton>(html`<mo-selectable-button disabled>Cash</mo-selectable-button>`)

		it('should disable the button it composes', () => {
			expect(fixture.component.renderRoot.querySelector('md-text-button')?.hasAttribute('disabled')).toBe(true)
		})
	})

	describe('in a selection group', () => {
		const fixture = new ComponentTestFixture<HTMLElement>(html`
			<mo-selection-group selectability='single' aria-label='Payment'>
				<mo-selectable-button value='cash'>Cash</mo-selectable-button>
				<mo-selectable-button value='card'>Card</mo-selectable-button>
			</mo-selection-group>
		`)

		const buttons = () => [...fixture.component.querySelectorAll('mo-selectable-button')]

		it('should announce the group\'s pattern', () => {
			expect(buttons().map(button => button.getAttribute('role'))).toEqual(['radio', 'radio'])
			expect(buttons().map(button => button.getAttribute('aria-checked'))).toEqual(['false', 'false'])
			expect(buttons().every(button => button.hasAttribute('aria-pressed'))).toBe(false)
		})

		it('should let the group rule instead of answering itself', async () => {
			buttons()[0]!.click()
			await fixture.updateComplete
			buttons()[1]!.click()
			await fixture.updateComplete

			expect(buttons().map(button => button.selected)).toEqual([false, true])
			expect(buttons().map(button => button.getAttribute('aria-checked'))).toEqual(['false', 'true'])
		})
	})
})