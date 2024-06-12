import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Tooltip } from '.'
import '.'

describe('PopoverContainer', () => {
	describe('rich', () => {
		const fixture = new ComponentTestFixture<Tooltip>(html`
			<mo-tooltip>
				<mo-heading>Test</mo-heading>
				Content
			</mo-tooltip>
		`)

		it('should transition to rich mode when content contains elements', async () => {
			const tooltip = fixture.component
			expect(tooltip.rich).toBe(true)

			tooltip.innerHTML = '\n\nTest\n\n'
			await fixture.updateComplete
			expect(tooltip.rich).toBe(false)
		})
	})
})