import { component } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Notification, NotificationComponent } from '@a11d/lit-application'
import { Dialog } from './Dialog.js'

@NotificationComponent.defaultComponent()
@component('test-fake-notification')
export class FakeNotification extends NotificationComponent {
	notification: Notification
	show(): Promise<void> {
		return Promise.resolve()
	}
}

HTMLDialogElement.prototype.showModal = () => undefined

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