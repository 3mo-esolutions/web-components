import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Confetti } from './Confetti.js'
import './index.js'

describe('Confetti', () => {
	const fixture = new ComponentTestFixture<Confetti>('mo-confetti')

	const canvas = () => fixture.component.renderRoot.querySelector('canvas')!

	it('should be hidden until rain() is called', () => {
		expect(fixture.component.hidden).toBe(true)
		expect(getComputedStyle(fixture.component).display).toBe('none')
	})

	it('should show and size the canvas to the viewport while raining', async () => {
		// Prevent endless animation loop
		vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(0)
		vi.useFakeTimers()
		try {
			void fixture.component.rain()
			await fixture.component.updateComplete

			expect(fixture.component.hidden).toBe(false)
			expect(getComputedStyle(fixture.component).display).not.toBe('none')
			expect(canvas().width).toBe(window.innerWidth)
			expect(canvas().height).toBe(window.innerHeight)
		} finally {
			vi.useRealTimers()
		}
	})
})