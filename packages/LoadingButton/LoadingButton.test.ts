import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LoadingButton } from './LoadingButton.js'
import './index.js'

describe('LoadingButton', () => {
	const fixture = new ComponentTestFixture<LoadingButton>('mo-loading-button')

	it('should stop click events when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})

	it('should stop click events when loading', async () => {
		fixture.component.loading = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})

	// Regression: the click event target resolves to the rendered button, which does not exist
	// when the element gets disconnected before its first update - rejecting unhandled back then.
	it('should not reject when disconnected before its first update', async () => {
		const rejections = new Array<PromiseRejectionEvent>()
		const listener = (e: PromiseRejectionEvent) => rejections.push(e)
		window.addEventListener('unhandledrejection', listener)

		const button = document.createElement('mo-loading-button')
		document.body.appendChild(button)
		button.remove()
		await new Promise(r => setTimeout(r, 50))

		window.removeEventListener('unhandledrejection', listener)
		expect(rejections.map(e => String(e.reason))).toEqual([])
	})
})