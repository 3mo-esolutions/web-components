import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type CollapsibleCard } from './CollapsibleCard.js'
import './index.js'

const iconButtonOf = (card: CollapsibleCard) => card.renderRoot.querySelector('mo-expand-collapse-icon-button')!

describe('CollapsibleCard', () => {
	const fixture = new ComponentTestFixture<CollapsibleCard>(html`
		<mo-collapsible-card heading='Heading'>Body</mo-collapsible-card>
	`)

	describe('Expand/collapse icon-button', () => {
		it('should collapse when clicked', () => {
			const dispatchSpy = spyOn(fixture.component.collapse, 'dispatch')
			const collapsed = fixture.component.collapsed

			iconButtonOf(fixture.component).click()

			expect(fixture.component.collapsed).toBe(!collapsed)
			expect(dispatchSpy).toHaveBeenCalledOnceWith(!collapsed)
		})

		it('should not collapse when disabled', () => {
			const dispatchSpy = spyOn(fixture.component.collapse, 'dispatch')
			const collapsed = fixture.component.collapsed
			fixture.component.disableCollapse = true

			iconButtonOf(fixture.component).click()

			expect(fixture.component.collapsed).toBe(collapsed)
			expect(dispatchSpy).not.toHaveBeenCalled()
		})

		it('should reflect the open state as the inverse of "collapsed"', async () => {
			expect(iconButtonOf(fixture.component).open).toBe(true)

			fixture.component.collapsed = true
			await fixture.update()

			expect(iconButtonOf(fixture.component).open).toBe(false)
		})

		it('should be disabled while "disableCollapse" is set', async () => {
			expect(iconButtonOf(fixture.component).disabled).toBe(false)

			fixture.component.disableCollapse = true
			await fixture.update()

			expect(iconButtonOf(fixture.component).disabled).toBe(true)
		})
	})

	describe('Body', () => {
		const bodySlot = () => fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])')!
		// Shortened, so that the settled state can be awaited without slowing the suite down. Transitions are not sampled mid-flight.
		const settle = async () => {
			fixture.component.style.setProperty('--mo-collapsible-card-transition-duration', '30ms')
			await fixture.update()
			await new Promise(resolve => setTimeout(resolve, 120))
		}

		it('should keep the body rendered while collapsed, so that it can animate, but hidden and without height', async () => {
			fixture.component.collapsed = true
			await settle()

			expect(bodySlot()).not.toBeNull()
			expect(getComputedStyle(bodySlot()).height).toBe('0px')
			expect(getComputedStyle(bodySlot()).contentVisibility).toBe('hidden')
		})

		it('should show the body again once expanded', async () => {
			fixture.component.collapsed = true
			await settle()

			fixture.component.collapsed = false
			await settle()

			expect(getComputedStyle(bodySlot()).contentVisibility).toBe('visible')
			expect(parseFloat(getComputedStyle(bodySlot()).height)).toBeGreaterThan(0)
			expect(bodySlot().assignedNodes().map(node => node.textContent?.trim())).toEqual(['Body'])
		})
	})

	describe('collapsed', () => {
		it('should reflect as an attribute, as the collapsed layout styling depends on it', async () => {
			expect(fixture.component.hasAttribute('collapsed')).toBe(false)

			fixture.component.collapsed = true
			await fixture.update()

			expect(fixture.component.hasAttribute('collapsed')).toBe(true)
		})

		it('should not dispatch "collapse" for a programmatically set state, as only the interaction reports', async () => {
			const spy = jasmine.createSpy('collapse')
			fixture.component.addEventListener('collapse', spy)

			fixture.component.collapsed = true
			await fixture.update()

			expect(fixture.component.collapsed).toBe(true)
			expect(spy).not.toHaveBeenCalled()
		})
	})

	describe('showSubHeadingOnlyWhenCollapsed', () => {
		const subHeadingFixture = new ComponentTestFixture<CollapsibleCard>(html`
			<mo-collapsible-card heading='Heading' subHeading='Sub heading' showSubHeadingOnlyWhenCollapsed>Body</mo-collapsible-card>
		`)

		it('should hide the sub-heading while expanded and show it while collapsed', async () => {
			expect(subHeadingFixture.component.showSubHeadingOnlyWhenCollapsed).toBe(true)
			expect(subHeadingFixture.component.renderRoot.querySelector('[part=subHeading]')).toBeNull()

			subHeadingFixture.component.collapsed = true
			await subHeadingFixture.update()

			expect(subHeadingFixture.component.renderRoot.querySelector('[part=subHeading]')?.textContent?.trim()).toBe('Sub heading')
		})
	})
})