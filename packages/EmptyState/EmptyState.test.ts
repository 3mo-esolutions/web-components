import { ComponentTestFixture } from '@a11d/lit-testing'
import { type EmptyState } from './EmptyState.js'
import './index.js'

describe('EmptyState', () => {
	const fixture = new ComponentTestFixture<EmptyState>('mo-empty-state')

	const heading = () => fixture.component.renderRoot.querySelector('mo-heading')!
	const icon = () => fixture.component.renderRoot.querySelector('mo-icon')

	it('should not affect the opacity of assigned elements', () => {
		expect(getComputedStyle(heading()).opacity).toBe('1')
	})

	it('should render an icon only when "icon" is set', async () => {
		expect(icon()).toBeNull()

		fixture.component.icon = 'search_off'
		await fixture.updateComplete

		expect(icon()?.icon).toBe('search_off')

		fixture.component.icon = undefined
		await fixture.updateComplete

		expect(icon()).toBeNull()
	})

	it('should project its content into the heading', async () => {
		fixture.component.textContent = 'Nothing here'
		await fixture.update()

		const slot = fixture.component.renderRoot.querySelector('slot:not([name])')!
		expect(slot.parentElement).toBe(heading())
		expect((slot as HTMLSlotElement).assignedNodes().map(node => node.textContent)).toEqual(['Nothing here'])
	})
})