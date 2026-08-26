import { html } from '@a11d/lit'
import { CollapsibleCard } from './CollapsibleCard.js'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/expand-collapse-icon-button'

describe('CollapsibleCard', () => {
	const fixture = new ComponentTestFixture(() => {
		const card = new CollapsibleCard
		card.heading = 'Heading'
		return card
	})

	describe('Expand/collapse icon-button', () => {
		it('should collapse when clicked', () => {
			const dispatchSpy = spyOn(fixture.component.collapse, 'dispatch')
			const collapsed = fixture.component.collapsed

			fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.click()

			expect(fixture.component.collapsed).toBe(!collapsed)
			expect(dispatchSpy).toHaveBeenCalledOnceWith(!collapsed)
		})

		it('should not collapse when disabled', () => {
			const dispatchSpy = spyOn(fixture.component.collapse, 'dispatch')
			const collapsed = fixture.component.collapsed
			fixture.component.disableCollapse = true

			fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.click()

			expect(fixture.component.collapsed).toBe(collapsed)
			expect(dispatchSpy).not.toHaveBeenCalled()
		})
	})

	describe('Collapse animation', () => {
		// Shortened, so that a settled state can be awaited without slowing the suite down.
		const transitionDuration = 30

		const fixture = new ComponentTestFixture<CollapsibleCard>(html`
			<mo-collapsible-card heading='Heading' style='--mo-collapsible-card-transition-duration: ${transitionDuration}ms'>
				<div style='height: 120px'>Content</div>
			</mo-collapsible-card>
		`)

		const bodySlot = () => fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])')!
		const collapse = async (collapsed: boolean) => {
			fixture.component.collapsed = collapsed
			await fixture.component.updateComplete
		}
		// Transitions cannot be sampled reliably mid-flight, hence only the settled states are asserted.
		const settle = () => new Promise(resolve => setTimeout(resolve, transitionDuration * 4))

		it('should keep the body in the DOM while collapsed, so that it can animate out', async () => {
			await collapse(true)

			expect(bodySlot()).not.toBeNull()
		})

		it('should end up with a hidden body of no height once collapsed', async () => {
			await collapse(true)
			await settle()

			const style = getComputedStyle(bodySlot())
			expect(style.height).toBe('0px')
			expect(style.contentVisibility).toBe('hidden')
			expect(style.paddingTop).toBe('0px')
			expect(style.paddingBottom).toBe('0px')
		})

		it('should end up with a visible body of its content height once expanded again', async () => {
			await collapse(true)
			await settle()

			await collapse(false)
			await settle()

			const style = getComputedStyle(bodySlot())
			expect(style.contentVisibility).toBe('visible')
			expect(parseFloat(style.height)).toBeGreaterThan(0)
		})
	})
})