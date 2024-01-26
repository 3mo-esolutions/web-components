import { ComponentTestFixture } from '@a11d/lit-testing'
import { Dialog } from './Dialog.js'

describe('Dialog', () => {
	const fixture = new ComponentTestFixture<Dialog>('mo-dialog')

	it('should re-dispatch the scroll event on scroll', () => {
		let scrollEvent: Event | undefined
		fixture.component.addEventListener('scroll', (e: Event) => scrollEvent = e)

		fixture.component
			.renderRoot.querySelector('md-dialog')
			?.renderRoot.querySelector('.scroller')
			?.dispatchEvent(new Event('scroll'))

		expect(scrollEvent).toBeDefined()
		expect(scrollEvent?.type).toBe('scroll')
	})
})