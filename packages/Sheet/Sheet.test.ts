import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type Sheet } from './Sheet.js'
import './index.js'

describe('Sheet', () => {
	// Restore native showModal if stubbed by other suites.
	const stubbedShowModal = HTMLDialogElement.prototype.showModal
	beforeAll(() => {
		const iframe = document.createElement('iframe')
		document.body.append(iframe)
		HTMLDialogElement.prototype.showModal = (iframe.contentWindow as unknown as { HTMLDialogElement: typeof HTMLDialogElement }).HTMLDialogElement.prototype.showModal
		iframe.remove()
	})
	afterAll(() => HTMLDialogElement.prototype.showModal = stubbedShowModal)

	const fixture = new ComponentTestFixture<Sheet>(html`
		<mo-sheet label='Options'>
			<p>Content</p>
		</mo-sheet>
	`)

	const open = async () => {
		fixture.component.open = true
		await fixture.updateComplete
	}

	const closed = () => new Promise<void>(resolve => fixture.component.dialogElement.addEventListener('close', () => resolve(), { once: true }))

	it('should render a closed native dialog with the label as its accessible name', () => {
		expect(fixture.component.dialogElement instanceof HTMLDialogElement).toBe(true)
		expect(fixture.component.dialogElement.open).toBe(false)
		expect(fixture.component.dialogElement.getAttribute('aria-label')).toBe('Options')
	})

	it('should show the dialog modally when opened', async () => {
		await open()

		expect(fixture.component.dialogElement.open).toBe(true)
		expect(fixture.component.dialogElement.matches(':modal')).toBe(true)
	})

	it('should not dispatch openChange for the state it is rendered with', async () => {
		const openChange = jasmine.createSpy('openChange')
		fixture.component.addEventListener('openChange', openChange)
		await fixture.updateComplete

		expect(openChange).not.toHaveBeenCalled()
	})

	it('should dispatch openChange whenever the open state changes', async () => {
		const states = new Array<boolean>()
		fixture.component.addEventListener('openChange', (e: Event) => states.push((e as CustomEvent<boolean>).detail))

		await open()
		fixture.component.open = false
		await fixture.updateComplete

		expect(states).toEqual([true, false])
	})

	it('should close on cancel, routing it through a "requestClose" event with "escape" as its source', async () => {
		let source: string | undefined
		fixture.component.addEventListener('requestClose', (e: Event) => source = (e as CustomEvent<{ source: string }>).detail.source)
		await open()

		const hasClosed = closed()
		fixture.component.dialogElement.dispatchEvent(new Event('cancel', { cancelable: true }))
		await hasClosed

		expect(source).toBe('escape')
		expect(fixture.component.open).toBe(false)
		expect(fixture.component.dialogElement.open).toBe(false)
	})

	const panel = () => fixture.component.renderRoot.querySelector('#panel')!
	const settle = () => Promise.allSettled(panel().getAnimations().map(animation => animation.finished))

	it('should play the exit animation before it closes the dialog', async () => {
		await open()
		const hasClosed = closed()

		fixture.component.open = false
		await fixture.updateComplete

		expect(panel().getAnimations().length).toBeGreaterThan(0)
		expect(fixture.component.dialogElement.open).toBe(true)

		await hasClosed
		expect(fixture.component.dialogElement.open).toBe(false)
	})

	it('should play the exit animation from the start when the sheet has settled open', async () => {
		await open()
		await settle()
		const hasClosed = closed()

		fixture.component.open = false
		await fixture.updateComplete

		const animation = panel().getAnimations()[0]
		expect(animation).toBeDefined()
		expect(animation?.playState).toBe('running')
		expect(Number(animation?.currentTime)).toBeLessThan(250)
		expect(fixture.component.dialogElement.open).toBe(true)

		await hasClosed
		expect(fixture.component.dialogElement.open).toBe(false)
	})

	it('should stay open when "requestClose" is prevented', async () => {
		fixture.component.addEventListener('requestClose', (e: Event) => e.preventDefault())
		await open()

		fixture.component.dialogElement.dispatchEvent(new Event('cancel', { cancelable: true }))
		await fixture.updateComplete

		expect(fixture.component.open).toBe(true)
		expect(fixture.component.dialogElement.open).toBe(true)
	})

	it('should close on a backdrop click but not on a click within the panel', async () => {
		await open()

		fixture.component.renderRoot.querySelector<HTMLElement>('[part=panel]')!.click()
		await fixture.updateComplete
		expect(fixture.component.open).toBe(true)

		fixture.component.dialogElement.click()
		await fixture.updateComplete
		expect(fixture.component.open).toBe(false)
	})

	it('should close when the handle is clicked', async () => {
		let source: string | undefined
		fixture.component.addEventListener('requestClose', (e: Event) => source = (e as CustomEvent<{ source: string }>).detail.source)
		await open()

		fixture.component.renderRoot.querySelector<HTMLElement>('[part=handle]')!.click()
		await fixture.updateComplete

		expect(source).toBe('handle')
		expect(fixture.component.open).toBe(false)
	})

	it('should synchronize its open state when the dialog closes natively', async () => {
		await open()

		fixture.component.dialogElement.close()
		await new Promise<void>(resolve => fixture.component.dialogElement.addEventListener('close', () => setTimeout(resolve), { once: true }))
		await fixture.updateComplete

		expect(fixture.component.open).toBe(false)
	})

	it('should reverse out of a motion still in flight from where the panel stands', async () => {
		await open()
		const entry = panel().getAnimations()[0]
		entry!.pause()
		entry!.currentTime = 125
		const offsetInFlight = getComputedStyle(panel()).translate

		fixture.component.open = false
		await fixture.updateComplete

		const exit = panel().getAnimations()[0]
		exit!.pause()
		exit!.currentTime = 0

		expect(getComputedStyle(panel()).translate).toBe(offsetInFlight)
	})

	it('should play the entry animation from the anchored edge when it is opened again', async () => {
		await open()
		await settle()
		const hasClosed = closed()
		fixture.component.open = false
		await hasClosed

		await open()

		const animation = panel().getAnimations()[0]
		expect(animation).toBeDefined()
		animation!.pause()
		animation!.currentTime = 0
		expect(getComputedStyle(panel()).translate).not.toBe('none')
	})

	it('should not render the handle for inline placements', async () => {
		fixture.component.placement = 'inline-start'
		await fixture.updateComplete

		const slot = fixture.component.renderRoot.querySelector('slot[name=handle]')!
		expect(getComputedStyle(slot).display).toBe('none')
	})

	it('should slot its content into the panel and provide a top-layer slot within the dialog', () => {
		const contentSlot = fixture.component.renderRoot.querySelector<HTMLSlotElement>('[part=content] slot')!
		expect(contentSlot.assignedElements()[0]?.textContent).toBe('Content')
		expect(fixture.component.dialogElement.querySelector('slot[name=top-layer]')).not.toBeNull()
	})
})