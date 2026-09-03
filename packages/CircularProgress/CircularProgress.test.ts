import { ComponentTestFixture } from '@a11d/lit-testing'
import { type CircularProgress } from './CircularProgress.js'
import './index.js'

type MdCircularProgress = HTMLElement & { value: number, indeterminate: boolean }

describe('CircularProgress', () => {
	const fixture = new ComponentTestFixture<CircularProgress>('mo-circular-progress')

	const mdCircularProgress = () => fixture.component.renderRoot.querySelector<MdCircularProgress>('md-circular-progress')!

	it('should be indeterminate when "progress" is not set', () => {
		expect(fixture.component.progress).toBeUndefined()
		expect(mdCircularProgress().indeterminate).toBe(true)
	})

	it('should tunnel "progress" to the md-circular-progress value', async () => {
		fixture.component.progress = 0.42
		await fixture.updateComplete

		expect(mdCircularProgress().value).toBe(0.42)
		expect(mdCircularProgress().indeterminate).toBe(false)
	})

	it('should return to indeterminate when "progress" is unset again', async () => {
		fixture.component.progress = 0.42
		await fixture.updateComplete
		expect(mdCircularProgress().indeterminate).toBe(false)

		fixture.component.progress = undefined
		await fixture.updateComplete

		expect(mdCircularProgress().indeterminate).toBe(true)
	})
})