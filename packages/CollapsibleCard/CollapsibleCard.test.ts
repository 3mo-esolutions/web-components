import { CollapsibleCard } from './CollapsibleCard.js'
import { ComponentTestFixture } from '../../test/index.js'

describe(CollapsibleCard.name, () => {
	const fixture = new ComponentTestFixture(() => {
		const card = new CollapsibleCard
		card.heading = 'Heading'
		return card
	})

	it('should collapse when icon-button is clicked', async () => {
		const collapsed = fixture.component.collapsed

		fixture.component.renderRoot.querySelector('mo-icon-button')?.click()

		expect(fixture.component.collapsed).toBe(!collapsed)
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