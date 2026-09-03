import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LinearProgress } from './LinearProgress.js'
import './index.js'

type MdLinearProgress = HTMLElement & { value: number, buffer: number, indeterminate: boolean }

describe('LinearProgress', () => {
	const fixture = new ComponentTestFixture<LinearProgress>('mo-linear-progress')

	const mdLinearProgress = () => fixture.component.renderRoot.querySelector<MdLinearProgress>('md-linear-progress')!

	it('should be indeterminate when neither "progress" nor "buffer" is set', () => {
		expect(mdLinearProgress().indeterminate).toBe(true)
	})

	it('should tunnel "progress" to the md-linear-progress value', async () => {
		fixture.component.progress = 0.4
		await fixture.updateComplete

		expect(mdLinearProgress().value).toBe(0.4)
	})

	it('should tunnel "buffer" to the md-linear-progress buffer', async () => {
		fixture.component.buffer = 0.7
		await fixture.updateComplete

		expect(mdLinearProgress().buffer).toBe(0.7)
	})

	it('should be determinate as soon as only "buffer" is set', async () => {
		fixture.component.buffer = 0.7
		await fixture.updateComplete

		expect(fixture.component.progress).toBeUndefined()
		expect(mdLinearProgress().indeterminate).toBe(false)
	})

	// BUG: reverse property is not applied
	xit('should reverse the direction of the progress when "reverse" is set', async () => {
		expect(getComputedStyle(fixture.component).transform).toBe('none')

		fixture.component.reverse = true
		await fixture.updateComplete

		expect(getComputedStyle(fixture.component).transform).toBe('matrix(-1, 0, 0, 1, 0, 0)')
	})
})