import { ComponentTestFixture } from '@a11d/lit-testing'
import { EmptyState } from './EmptyState.js'

describe('EmptyState', () => {
	const fixture = new ComponentTestFixture<EmptyState>('mo-empty-state')

	it('should not affect the opacity of assigned elements', () => {
		const heading = fixture.component.renderRoot.querySelector('mo-heading')!

		expect(getComputedStyle(heading).opacity).toBe('1')
	})
})