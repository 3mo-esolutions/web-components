import { ComponentTestFixture } from '@a11d/lit-testing'
import { type CloudflareStream, type CloudflareStreamAutoPause } from './CloudflareStream.js'
import './index.js'

describe('CloudflareStream', () => {
	const fixture = new ComponentTestFixture<CloudflareStream>('mo-cloudflare-stream')

	it('should have the default iframe allowances', () => {
		expect(fixture.component.renderRoot.querySelector('iframe')?.getAttribute('allow')).toBe('accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;')
		expect(fixture.component.renderRoot.querySelector('iframe')?.getAttribute('allowfullscreen')).not.toBe(null)
	})

	it('should hide the iframe element when "source" not set', () => {
		expect(fixture.component.renderRoot.querySelector('iframe')?.hidden).toBe(true)
	})

	it('should pass the source to the iframe', async () => {
		fixture.component.source = 'https://videodelivery.net/some-video-id/iframe'

		await fixture.updateComplete

		expect(fixture.component.iframeElement.getAttribute('src')).toBe('https://videodelivery.net/some-video-id/iframe')
		expect(fixture.component.iframeElement.hidden).toBe(false)
	})

	describe('autoPause', () => {
		const play = jasmine.createSpy('play')
		const pause = jasmine.createSpy('pause')
		const global = globalThis as { Stream?: unknown }
		let originalStream: unknown

		beforeEach(() => {
			play.calls.reset()
			pause.calls.reset()
			originalStream = global.Stream
			global.Stream = () => ({ play, pause })
		})

		afterEach(() => global.Stream = originalStream)

		const autoPauseFixture = new ComponentTestFixture<CloudflareStream>('mo-cloudflare-stream')

		const placeWithVisibleHeight = (visibleHeight: number) => {
			const height = 100
			const top = window.innerHeight - visibleHeight
			spyOn(autoPauseFixture.component, 'getBoundingClientRect')
				.and.returnValue(new DOMRect(0, top, 200, height))
		}

		const scroll = () => window.dispatchEvent(new Event('scroll'))

		it('should not touch the stream when autoPause is not set', async () => {
			placeWithVisibleHeight(-100)

			scroll()
			await autoPauseFixture.updateComplete

			expect(pause).not.toHaveBeenCalled()
			expect(play).not.toHaveBeenCalled()
		})

		const strategies = new Map<CloudflareStreamAutoPause, number>([
			['when-not-in-viewport', 0],
			['when-quarter-in-viewport', 25],
			['when-half-in-viewport', 50],
		])

		for (const [strategy, requiredVisibleHeight] of strategies) {
			it(`should pause the stream when the element leaves the viewport per the configured strategy - ${strategy}`, async () => {
				placeWithVisibleHeight(requiredVisibleHeight - 5)

				autoPauseFixture.component.autoPause = strategy
				await autoPauseFixture.updateComplete

				expect(pause).toHaveBeenCalled()
				expect(play).not.toHaveBeenCalled()
			})
		}

		it('should resume playing once the element is sufficiently in the viewport again', async () => {
			placeWithVisibleHeight(-100)
			autoPauseFixture.component.autoPause = 'when-half-in-viewport'
			await autoPauseFixture.updateComplete
			expect(pause).toHaveBeenCalled()
			pause.calls.reset()

			autoPauseFixture.component.getBoundingClientRect = () => new DOMRect(0, 0, 200, 100)
			scroll()

			expect(play).toHaveBeenCalled()
			expect(pause).not.toHaveBeenCalled()
		})
	})
})