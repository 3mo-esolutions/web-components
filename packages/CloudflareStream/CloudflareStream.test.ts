import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { CloudflareStream } from './CloudflareStream.js'

describe(CloudflareStream.name, () => {
	const fixture = new ComponentTestFixture(() => document.createElement('mo-cloudflare-stream'))

	it('should have the default iframe allowances', () => {
		expect(fixture.component.renderRoot.querySelector('iframe')?.getAttribute('allow')).toBe('accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;')
		expect(fixture.component.renderRoot.querySelector('iframe')?.getAttribute('allowfullscreen')).not.toBe(null)
	})

	it('should hide the iframe element when "source" not set', () => {
		expect(fixture.component.renderRoot.querySelector('iframe')?.hidden).toBe(true)
	})
})