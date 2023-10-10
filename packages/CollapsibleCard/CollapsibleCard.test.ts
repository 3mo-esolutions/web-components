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
})