import { CollapsibleCard } from './CollapsibleCard.js'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'

describe(CollapsibleCard.name, () => {
	const fixture = new ComponentTestFixture(() => {
		const card = new CollapsibleCard
		card.heading = 'Heading'
		return card
	})

	it('should collapse when icon-button is clicked', () => {
		const collapsed = fixture.component.collapsed

		fixture.component.renderRoot.querySelector('mo-icon-button')?.click()

		expect(fixture.component.collapsed).toBe(!collapsed)
	})

	it('should not collapse when disabled', () => {
		const collapsed = fixture.component.collapsed
		fixture.component.disableCollapse = true

		fixture.component.renderRoot.querySelector('mo-icon-button')?.click()

		expect(fixture.component.collapsed).toBe(collapsed)
	})

	it('should dispatch "collapse" event when collapsed', () => {
		let value = false
		const spy = jasmine.createSpy().and.callFake((e: CustomEvent<boolean>) => value = e.detail)
		fixture.component.addEventListener('collapse', spy)

		fixture.component.renderRoot.querySelector('mo-icon-button')?.click()

		expect(spy).toHaveBeenCalled()
		expect(value).toBe(true)
	})

	it('should switch to icon "expand_less" when not collapsed', async () => {
		const iconButton = fixture.component.renderRoot.querySelector('mo-icon-button')

		fixture.component.collapsed = false
		await fixture.updateComplete

		expect(iconButton?.icon).toBe('expand_less')
	})

	it('should switch to "expand_more" icon when collapsed', async () => {
		const iconButton = fixture.component.renderRoot.querySelector('mo-icon-button')

		fixture.component.collapsed = true
		await fixture.updateComplete

		expect(iconButton?.icon).toBe('expand_more')
	})
})