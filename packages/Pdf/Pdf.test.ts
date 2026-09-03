import { ComponentTestFixture } from '@a11d/lit-testing'
import * as System from 'detect-browser'
import { type Pdf } from './Pdf.js'
import './index.js'

describe('Pdf', () => {
	const fixture = new ComponentTestFixture<Pdf>('mo-pdf')

	const system = System.detect()
	const isMacOrSafari = system?.os === 'Mac OS' || system?.name === 'safari'
	const isAndroidChromium = system?.os === 'Android OS' && system?.name !== 'firefox'
	const isIOS = system?.os === 'iOS'
	const supportsEmbed = !isMacOrSafari && !isIOS
	const supportsLoading = !isMacOrSafari && !isAndroidChromium && !isIOS

	const viewer = () => fixture.component.renderRoot.querySelector('[data-pdf]')

	it('should render nothing without a source', () => {
		expect(fixture.component.source).toBeUndefined()
		expect(viewer()).toBeNull()
		expect(fixture.component.renderRoot.querySelector('mo-circular-progress')).toBeNull()
	})

	it('should render the pdf viewer with the given source once set', async () => {
		fixture.component.source = 'https://example.com/test.pdf'

		await fixture.updateComplete

		expect(viewer()).not.toBeNull()
		expect(viewer()!.localName).toBe(supportsEmbed ? 'embed' : 'iframe')
		expect(viewer()!.getAttribute('src')).toBe('https://example.com/test.pdf')
		expect(viewer()!.getAttribute('type')).toBe('application/pdf')
	})

	it('should reflect loading and drop it once the viewer fires load', async () => {
		if (!supportsLoading) {
			pending('The platform does not support telling a loading pdf viewer from a loaded one')
			return
		}

		fixture.component.source = 'https://example.com/test.pdf'
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('loading')).toBeTrue()
		expect(fixture.component.renderRoot.querySelector('mo-circular-progress')).not.toBeNull()

		viewer()!.dispatchEvent(new Event('load'))
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('loading')).toBeFalse()
		expect(fixture.component.renderRoot.querySelector('mo-circular-progress')).toBeNull()
	})
})