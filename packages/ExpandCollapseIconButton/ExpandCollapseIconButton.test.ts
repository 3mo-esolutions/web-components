import { ComponentTestFixture } from '@a11d/lit-testing'
import { type ExpandCollapseIconButton } from './ExpandCollapseIconButton.js'
import './index.js'

describe('ExpandCollapseIconButton', () => {
	const fixture = new ComponentTestFixture<ExpandCollapseIconButton>('mo-expand-collapse-icon-button')

	const getIconButton = () => fixture.component.renderRoot.querySelector('mo-icon-button')!

	const settledTransformOf = async (open: boolean) => {
		const iconButton = getIconButton()
		iconButton.style.transition = 'none'
		fixture.component.open = open
		await fixture.updateComplete
		iconButton.getAnimations().forEach(animation => animation.finish())
		return getComputedStyle(iconButton).transform
	}

	it('should not be open by default', () => {
		expect(fixture.component.open).toBe(false)
	})

	it('should disable the icon-button when disabled', async () => {
		fixture.component.disabled = true

		await fixture.updateComplete

		expect(getIconButton().disabled).toBe(true)
	})

	it('should rotate the icon-button by 180 degrees when open', async () => {
		const matrix = new DOMMatrixReadOnly(await settledTransformOf(true))

		expect(matrix.a).toBeCloseTo(-1, 5)
		expect(matrix.d).toBeCloseTo(-1, 5)
		expect(matrix.b).toBeCloseTo(0, 5)
		expect(matrix.c).toBeCloseTo(0, 5)
	})

	it('should return the icon-button to its resting rotation when closed again', async () => {
		await settledTransformOf(true)

		expect(await settledTransformOf(false)).toBe('none')
	})
})