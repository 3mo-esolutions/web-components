import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Drawer } from './Drawer.js'
import './index.js'

describe('Drawer', () => {
	// Another suite stubs "showModal" out globally for the whole bundle, so the native
	// implementation is recovered from a pristine realm for the duration of this suite.
	const stubbedShowModal = HTMLDialogElement.prototype.showModal
	beforeAll(() => {
		const iframe = document.createElement('iframe')
		document.body.append(iframe)
		HTMLDialogElement.prototype.showModal = (iframe.contentWindow as unknown as { HTMLDialogElement: typeof HTMLDialogElement }).HTMLDialogElement.prototype.showModal
		iframe.remove()
	})
	afterAll(() => HTMLDialogElement.prototype.showModal = stubbedShowModal)

	const fixture = new ComponentTestFixture<Drawer>(html`
		<mo-drawer>Drawer content</mo-drawer>
	`)

	/** The dialog outlives the "open" property by the exit animation, so closing is awaited through it. */
	const closed = () => new Promise<void>(resolve => fixture.component.dialogElement.addEventListener('close', () => resolve(), { once: true }))

	it('should be anchored to the inline-start edge', () => {
		expect(fixture.component.placement).toBe('inline-start')
	})

	it('should reflect the open attribute', async () => {
		expect(fixture.component.open).toBeFalse()

		fixture.component.open = true
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('open')).toBeTrue()
		expect(fixture.component.dialogElement.matches(':modal')).toBeTrue()
	})

	it('should close on Escape', async () => {
		fixture.component.open = true
		await fixture.updateComplete

		const hasClosed = closed()
		fixture.component.dialogElement.dispatchEvent(new Event('cancel', { cancelable: true }))
		await hasClosed

		expect(fixture.component.open).toBeFalse()
	})

	it('should still be sized by the Material width it used to have', async () => {
		fixture.component.style.setProperty('--mdc-drawer-width', '300px')
		fixture.component.open = true
		await fixture.updateComplete

		const panel = fixture.component.renderRoot.querySelector<HTMLElement>('#panel')!
		expect(getComputedStyle(panel).getPropertyValue('--mo-sheet-size').trim()).toBe('300px')
	})

	it('should prefer its own width over the Material one', async () => {
		fixture.component.style.setProperty('--mdc-drawer-width', '300px')
		fixture.component.style.setProperty('--mo-drawer-width', '400px')
		fixture.component.open = true
		await fixture.updateComplete

		const panel = fixture.component.renderRoot.querySelector<HTMLElement>('#panel')!
		expect(getComputedStyle(panel).getPropertyValue('--mo-sheet-size').trim()).toBe('400px')
	})
})