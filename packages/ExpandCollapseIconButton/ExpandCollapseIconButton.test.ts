import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { ExpandCollapseIconButton } from './ExpandCollapseIconButton.js'

describe('ExpandCollapseIconButton', () => {
	const fixture = new ComponentTestFixture<ExpandCollapseIconButton>('mo-expand-collapse-icon-button')

	it('should not be open by default', () => {
		expect(fixture.component.open).toBe(false)
	})

	it('should not be disabled by default', () => {
		expect(fixture.component.disabled).toBe(false)
	})

	it('should disable the icon-button when disabled', async () => {
		fixture.component.disabled = true

		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('mo-icon-button')?.disabled).toBe(true)
	})

	it('should rotate the icon-button when open', async () => {
		const iconButton = fixture.component.renderRoot.querySelector('mo-icon-button')
		expect(!iconButton ? undefined : getComputedStyle(iconButton).transform).toBe('none')

		fixture.component.open = true
		await fixture.updateComplete
		expect(!iconButton ? undefined : getComputedStyle(iconButton).transform).toBe('matrix(1, 0, 0, 1, 0, 0)')

		fixture.component.open = false
		await fixture.updateComplete
		expect(!iconButton ? undefined : getComputedStyle(iconButton).transform).toBe('none')
	})
})