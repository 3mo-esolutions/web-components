import { html, render, type ReactiveController } from '@a11d/lit'
import { SheetController, type SheetControllerHost } from './SheetController.js'
import { type SheetPlacement } from './SheetPlacement.js'

class FakeHost extends EventTarget implements SheetControllerHost {
	private readonly controllers = new Set<ReactiveController>()
	private pending?: Promise<void>
	private _open = false

	placement: SheetPlacement = 'block-end'

	get open() { return this._open }
	set open(value: boolean) {
		this._open = value
		this.requestUpdate()
	}

	addController(controller: ReactiveController) { this.controllers.add(controller) }
	removeController(controller: ReactiveController) { this.controllers.delete(controller) }

	requestUpdate() {
		this.pending ??= Promise.resolve().then(() => {
			this.pending = undefined
			this.controllers.forEach(controller => controller.hostUpdated?.())
		})
	}

	get updateComplete() {
		return (this.pending ?? Promise.resolve()).then(() => true)
	}
}

describe('SheetController', () => {
	// Restore native showModal if stubbed by other suites.
	const stubbedShowModal = HTMLDialogElement.prototype.showModal
	beforeAll(() => {
		const iframe = document.createElement('iframe')
		document.body.append(iframe)
		HTMLDialogElement.prototype.showModal = (iframe.contentWindow as unknown as { HTMLDialogElement: typeof HTMLDialogElement }).HTMLDialogElement.prototype.showModal
		iframe.remove()
	})
	afterAll(() => HTMLDialogElement.prototype.showModal = stubbedShowModal)

	let host: FakeHost
	let controller: SheetController
	let container: HTMLElement

	beforeEach(async () => {
		container = document.createElement('div')
		document.body.append(container)
		host = new FakeHost()
		controller = new SheetController(host, { autofocusTarget: () => container.querySelector<HTMLElement>('[autofocus]') })
		render(html`
			<dialog ${controller.dialog()}>
				<div id='panel' ${controller.panel()}>
					<button id='handle' ${controller.handle()}></button>
					<input autofocus>
				</div>
			</dialog>
		`, container)
		host.requestUpdate()
		await host.updateComplete
	})

	afterEach(() => {
		controller.swipe.abandon()
		container.remove()
	})

	const dialog = () => container.querySelector('dialog')!
	const closed = () => new Promise<void>(resolve => dialog().addEventListener('close', () => resolve(), { once: true }))
	const open = async () => {
		host.open = true
		await host.updateComplete
	}

	it('should stamp the placement onto the dialog and follow the host', async () => {
		expect(dialog().dataset.placement).toBe('block-end')

		host.placement = 'inline-end'
		host.requestUpdate()
		await host.updateComplete

		expect(dialog().dataset.placement).toBe('inline-end')
	})

	it('should show the dialog modally when the host opens', async () => {
		await open()

		expect(dialog().open).toBe(true)
		expect(dialog().matches(':modal')).toBe(true)
	})

	it('should focus the autofocus target once shown', async () => {
		await open()
		await new Promise(requestAnimationFrame)

		expect(document.activeElement).toBe(container.querySelector('input'))
	})

	it('should route cancel through a "requestClose" event on the host, naming "escape" as its source', async () => {
		let source: string | undefined
		host.addEventListener('requestClose', event => source = (event as CustomEvent<{ source: string }>).detail.source)
		await open()

		const hasClosed = closed()
		dialog().dispatchEvent(new Event('cancel', { cancelable: true }))
		await hasClosed

		expect(source).toBe('escape')
		expect(host.open).toBe(false)
		expect(dialog().open).toBe(false)
	})

	it('should keep the dialog open when "requestClose" is prevented', async () => {
		host.addEventListener('requestClose', event => event.preventDefault())
		await open()

		dialog().dispatchEvent(new Event('cancel', { cancelable: true }))
		await host.updateComplete

		expect(host.open).toBe(true)
		expect(dialog().open).toBe(true)
	})

	it('should close on a backdrop click but not on a click within the panel', async () => {
		await open()

		container.querySelector<HTMLElement>('#panel')!.click()
		await host.updateComplete
		expect(host.open).toBe(true)

		const hasClosed = closed()
		dialog().click()
		await hasClosed
		expect(host.open).toBe(false)
	})

	it('should close when the handle is clicked, naming "handle" as the source', async () => {
		let source: string | undefined
		host.addEventListener('requestClose', event => source = (event as CustomEvent<{ source: string }>).detail.source)
		await open()

		const hasClosed = closed()
		container.querySelector<HTMLElement>('#handle')!.click()
		await hasClosed

		expect(source).toBe('handle')
		expect(host.open).toBe(false)
	})

	describe('swiping', () => {
		const panel = () => container.querySelector<HTMLElement>('#panel')!
		const handle = () => container.querySelector<HTMLElement>('#handle')!

		const pointer = (type: string, y: number, timeStamp = 0) => Object.defineProperty(
			new PointerEvent(type, { clientX: 0, clientY: y, pointerId: 1, isPrimary: true, bubbles: true, composed: true }),
			'timeStamp', { value: timeStamp }
		)

		const swipe = async (distances: Array<number>, { timeStep = 100 } = {}) => {
			handle().dispatchEvent(pointer('pointerdown', 0))
			let time = 0
			for (const distance of distances) {
				time += timeStep
				window.dispatchEvent(pointer('pointermove', distance, time))
			}
			window.dispatchEvent(pointer('pointerup', distances.at(-1) ?? 0, time + timeStep))
			await host.updateComplete
		}

		beforeEach(async () => {
			panel().style.blockSize = '200px'
			await open()
		})

		it('should follow the pointer once the gesture has left its dead zone', async () => {
			handle().dispatchEvent(pointer('pointerdown', 0))
			window.dispatchEvent(pointer('pointermove', 2, 10))
			expect(panel().style.translate).toBe('')

			window.dispatchEvent(pointer('pointermove', 40, 20))
			expect(panel().style.translate).toContain('40px')

			window.dispatchEvent(pointer('pointerup', 40, 30))
			await host.updateComplete
		})

		it('should return to rest when released short of the threshold', async () => {
			await swipe([10, 20])

			expect(host.open).toBe(true)
			expect(dialog().open).toBe(true)
		})

		it('should dismiss when released beyond a quarter of the travel', async () => {
			const hasClosed = closed()
			await swipe([40, 120])
			await hasClosed

			expect(host.open).toBe(false)
			expect(dialog().open).toBe(false)
		})

		it('should dismiss a short but fast throw', async () => {
			const hasClosed = closed()
			await swipe([10, 30], { timeStep: 16 })
			await hasClosed

			expect(host.open).toBe(false)
		})

		it('should name "gesture" as the source, which a listener can refuse', async () => {
			let source: string | undefined
			host.addEventListener('requestClose', event => {
				source = (event as CustomEvent<{ source: string }>).detail.source
				event.preventDefault()
			})

			await swipe([40, 120])

			expect(source).toBe('gesture')
			expect(host.open).toBe(true)
			expect(dialog().open).toBe(true)
		})

		it('should not mistake a slow drag reported in rapid samples for a throw', async () => {
			await swipe([4, 8, 12, 16, 20], { timeStep: 2 })

			expect(host.open).toBe(true)
			expect(dialog().open).toBe(true)
		})

		it('should not be a throw when the gesture was held still before release', async () => {
			handle().dispatchEvent(pointer('pointerdown', 0))
			window.dispatchEvent(pointer('pointermove', 20, 10))
			window.dispatchEvent(pointer('pointermove', 40, 30))
			window.dispatchEvent(pointer('pointerup', 40, 400))
			await host.updateComplete

			expect(host.open).toBe(true)
		})

		it('should stay where it stands when the browser takes the gesture over to scroll with', async () => {
			handle().dispatchEvent(pointer('pointerdown', 0))
			window.dispatchEvent(pointer('pointermove', 120, 100))
			window.dispatchEvent(pointer('pointercancel', 120, 120))
			await host.updateComplete

			expect(host.open).toBe(true)
			expect(dialog().open).toBe(true)
		})

		it('should be swipeable from the panel itself, not only from the handle', async () => {
			const hasClosed = closed()
			panel().dispatchEvent(pointer('pointerdown', 0))
			window.dispatchEvent(pointer('pointermove', 40, 100))
			window.dispatchEvent(pointer('pointermove', 120, 200))
			window.dispatchEvent(pointer('pointerup', 120, 260))
			await hasClosed

			expect(host.open).toBe(false)
		})

		it('should refuse a gesture which begins in content still able to scroll away from the exit', () => {
			const scroller = document.createElement('div')
			scroller.id = 'scroller'
			Object.assign(scroller.style, { blockSize: '50px', overflow: 'auto' })
			scroller.innerHTML = '<div style="block-size: 400px"></div>'
			panel().append(scroller)
			scroller.scrollTop = 100

			scroller.dispatchEvent(pointer('pointerdown', 0))
			window.dispatchEvent(pointer('pointermove', 60, 100))

			expect(panel().style.translate).toBe('')
			window.dispatchEvent(pointer('pointerup', 60, 200))
		})

		describe('claiming the touch from the browser', () => {
			const touch = (target: HTMLElement, x: number, y: number) => {
				if (typeof Touch === 'undefined') {
					return undefined
				}
				const event = new TouchEvent('touchmove', {
					touches: [new Touch({ identifier: 1, target, clientX: x, clientY: y })],
					cancelable: true, bubbles: true,
				})
				window.dispatchEvent(event)
				return event
			}

			it('should claim a gesture which runs along its axis', () => {
				handle().dispatchEvent(pointer('pointerdown', 0))
				const event = touch(handle(), 0, 40)
				if (!event) {
					pending('the engine has no touch events')
				}

				expect(event?.defaultPrevented).toBe(true)
			})

			it('should leave a gesture which runs across its axis to the browser', () => {
				handle().dispatchEvent(pointer('pointerdown', 0))
				const event = touch(handle(), 60, 3)
				if (!event) {
					pending('the engine has no touch events')
				}

				expect(event?.defaultPrevented).toBe(false)
			})

			it('should leave the gesture to content which can still scroll the way the finger goes', () => {
				const scroller = document.createElement('div')
				Object.assign(scroller.style, { blockSize: '50px', overflow: 'auto' })
				scroller.innerHTML = '<div style="block-size: 400px"></div>'
				panel().append(scroller)
				scroller.scrollTop = 100

				scroller.dispatchEvent(pointer('pointerdown', 0))
				const event = touch(scroller, 0, 40)
				if (!event) {
					pending('the engine has no touch events')
				}

				expect(event?.defaultPrevented).toBe(false)
				expect(panel().style.translate).toBe('')
			})
		})

		it('should leave a gesture across its own axis to whatever scrolls there', () => {
			handle().dispatchEvent(pointer('pointerdown', 0))
			const across = new PointerEvent('pointermove', { clientX: 40, clientY: 6, pointerId: 1, isPrimary: true, bubbles: true })
			window.dispatchEvent(across)

			expect(panel().style.translate).toBe('')
		})

		it('should not be swipeable while closed', async () => {
			host.open = false
			await host.updateComplete
			await new Promise(resolve => setTimeout(resolve, 350))

			handle().dispatchEvent(pointer('pointerdown', 0))
			window.dispatchEvent(pointer('pointermove', 60, 20))

			expect(panel().style.translate).toBe('')
		})
	})

	it('should synchronize the host when the dialog closes natively', async () => {
		await open()

		const hasClosed = closed()
		dialog().close()
		await hasClosed
		await host.updateComplete

		expect(host.open).toBe(false)
	})
})