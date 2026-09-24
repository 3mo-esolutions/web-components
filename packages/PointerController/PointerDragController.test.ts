import { component, Component, html, type ReactiveController } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PointerDragController, type PointerDrag } from './PointerDragController.js'

class FakeHost {
	private readonly controllers = new Set<ReactiveController>()
	addController(controller: ReactiveController) { this.controllers.add(controller) }
	removeController(controller: ReactiveController) { this.controllers.delete(controller) }
	requestUpdate() { this.controllers.forEach(controller => controller.hostUpdated?.()) }
	get updateComplete() { return Promise.resolve(true) }
}

const pointer = (type: string, x: number, y: number, init: PointerEventInit = {}) => new PointerEvent(type, {
	clientX: x,
	clientY: y,
	pointerId: 1,
	isPrimary: true,
	button: 0,
	buttons: type === 'pointerdown' || type === 'pointermove' ? 1 : 0,
	bubbles: true,
	composed: true,
	cancelable: true,
	...init,
})

const move = (x: number, y: number, init?: PointerEventInit) => window.dispatchEvent(pointer('pointermove', x, y, init))
const release = (x: number, y: number) => window.dispatchEvent(pointer('pointerup', x, y))

const touchMove = (target: Element, x: number, y: number) => {
	if (typeof Touch === 'undefined') {
		return undefined
	}
	const event = new TouchEvent('touchmove', {
		touches: [new Touch({ identifier: 1, target, clientX: x, clientY: y })],
		cancelable: true,
		bubbles: true,
	})
	window.dispatchEvent(event)
	return event
}

const report = (name: string, { deltaX, deltaY }: PointerDrag) => `${name} ${deltaX},${deltaY}`

describe('PointerDragController', () => {
	let host: FakeHost
	let target: HTMLElement
	let controller: PointerDragController
	let log: Array<string>
	let threshold: number | undefined
	let holdDuration: number | undefined
	let disabled: boolean
	let accepts: boolean
	let isDrag: ((deltaX: number, deltaY: number) => boolean) | undefined

	beforeEach(() => {
		target = document.createElement('div')
		document.body.append(target)
		log = []
		threshold = undefined
		holdDuration = undefined
		disabled = false
		accepts = true
		isDrag = undefined
		host = new FakeHost()
		controller = new PointerDragController(host, {
			get target() { return target },
			get threshold() { return threshold },
			get holdDuration() { return holdDuration },
			get disabled() { return disabled },
			handlePress: () => accepts,
			isDrag: (deltaX, deltaY) => isDrag?.(deltaX, deltaY) ?? true,
			handleDragStart: drag => log.push(report('start', drag)),
			handleDrag: drag => log.push(report('drag', drag)),
			handleDragEnd: drag => log.push(report('end', drag)),
			handleDragCancel: () => log.push('cancel'),
		})
		host.requestUpdate()
	})

	afterEach(() => {
		controller.abandon()
		target.remove()
	})

	const press = (x = 0, y = 0, init?: PointerEventInit) => target.dispatchEvent(pointer('pointerdown', x, y, init))

	describe('starting', () => {
		it('should not start a drag before the press has travelled the threshold', () => {
			press()
			move(3, 0)
			expect(log).toEqual([])
			expect(controller.dragging).toBe(false)

			move(4, 0)
			expect(log).toEqual(['start 4,0', 'drag 4,0'])
			expect(controller.dragging).toBe(true)
		})

		it('should start on the press itself with a threshold of 0', () => {
			threshold = 0
			press(5, 5)

			expect(log).toEqual(['start 0,0'])
			expect(controller.dragging).toBe(true)
		})

		it('should report every movement relative to where the press began', () => {
			const drags = new Array<PointerDrag>()
			const recorder = new PointerDragController(host, {
				get target() { return target },
				handleDrag: drag => drags.push(drag),
			})
			host.requestUpdate()

			press(10, 20)
			move(20, 20)
			move(30, 25)

			expect(drags.map(({ origin, deltaX, deltaY }) => ({ origin, deltaX, deltaY }))).toEqual([
				{ origin: { x: 10, y: 20 }, deltaX: 10, deltaY: 0 },
				{ origin: { x: 10, y: 20 }, deltaX: 20, deltaY: 5 },
			])
			recorder.abandon()
		})

		it('should only answer the main button of the primary pointer', () => {
			press(0, 0, { isPrimary: false })
			move(20, 0)
			press(0, 0, { button: 2 })
			move(20, 0)

			expect(log).toEqual([])
		})

		it('should not answer while disabled', () => {
			disabled = true
			press()
			move(20, 0)

			expect(log).toEqual([])
		})

		it('should leave a press alone which the host refuses', () => {
			accepts = false
			press()
			move(20, 0)

			expect(log).toEqual([])
		})

		it('should ignore the movements of other pointers', () => {
			press()
			move(20, 0, { pointerId: 2 })

			expect(log).toEqual([])
		})
	})

	describe('the first movement', () => {
		it('should be judged once, and never for sub-pixel jitter', () => {
			const judged = new Array<string>()
			isDrag = (deltaX, deltaY) => (judged.push(`${deltaX},${deltaY}`), true)

			press()
			move(0.5, 0.25)
			move(2, 1)
			move(10, 1)

			expect(judged).toEqual(['2,1'])
			expect(log).toEqual(['start 10,1', 'drag 10,1'])
		})

		it('should leave a gesture which is not a drag to the browser', () => {
			isDrag = (deltaX, deltaY) => Math.abs(deltaX) >= Math.abs(deltaY)

			press()
			move(1, 5)
			move(40, 5)

			expect(log).toEqual([])
		})

		it('should claim a touch it drags from the browser', context => {
			press(0, 0, { pointerType: 'touch' })
			const event = touchMove(target, 40, 0)
			if (!event) {
				context.skip('the engine has no touch events')
			}

			expect(event?.defaultPrevented).toBe(true)
		})

		it('should leave a touch which is not a drag to the browser', context => {
			isDrag = () => false
			press(0, 0, { pointerType: 'touch' })
			const event = touchMove(target, 40, 0)
			if (!event) {
				context.skip('the engine has no touch events')
			}

			expect(event?.defaultPrevented).toBe(false)
		})
	})

	describe('holding a touch', () => {
		beforeEach(() => {
			vi.useFakeTimers()
			holdDuration = 500
		})
		afterEach(() => vi.useRealTimers())

		it('should start once the touch has been held, however little it moved', () => {
			press(0, 0, { pointerType: 'touch' })
			move(5, 0, { pointerType: 'touch' })
			expect(log).toEqual([])

			vi.advanceTimersByTime(500)
			expect(log).toEqual(['start 5,0'])

			move(40, 0, { pointerType: 'touch' })
			expect(log).toEqual(['start 5,0', 'drag 40,0'])
		})

		it('should leave the touch to the browser while it is being held', context => {
			press(0, 0, { pointerType: 'touch' })
			const event = touchMove(target, 5, 0)
			if (!event) {
				context.skip('the engine has no touch events')
			}

			expect(event?.defaultPrevented).toBe(false)
		})

		it('should leave a touch which moves before it is held to the browser', () => {
			press(0, 0, { pointerType: 'touch' })
			move(0, 20, { pointerType: 'touch' })
			vi.advanceTimersByTime(600)

			expect(log).toEqual([])
		})

		it('should drag a mouse by distance alone', () => {
			press(0, 0, { pointerType: 'mouse' })
			move(10, 0, { pointerType: 'mouse' })

			expect(log).toEqual(['start 10,0', 'drag 10,0'])
		})
	})

	describe('ending', () => {
		it('should end the drag with the release', () => {
			press()
			move(20, 5)
			release(20, 5)

			expect(log).toEqual(['start 20,5', 'drag 20,5', 'end 20,5'])
			expect(controller.dragging).toBe(false)
		})

		it('should swallow the click which follows a drag, and no later one', async () => {
			const clicks = vi.fn()
			document.addEventListener('click', clicks)

			press()
			move(20, 0)
			release(20, 0)
			target.click()
			expect(clicks).not.toHaveBeenCalled()

			await new Promise(resolve => setTimeout(resolve))
			target.click()
			expect(clicks).toHaveBeenCalledTimes(1)
			document.removeEventListener('click', clicks)
		})

		it('should leave a press which never became a drag an ordinary click', () => {
			const clicks = vi.fn()
			document.addEventListener('click', clicks)

			press()
			move(2, 0)
			release(2, 0)
			target.click()

			expect(log).toEqual([])
			expect(clicks).toHaveBeenCalledTimes(1)
			document.removeEventListener('click', clicks)
		})

		it('should report a drag which the browser takes over as cancelled', () => {
			press()
			move(20, 0)
			window.dispatchEvent(pointer('pointercancel', 20, 0))

			expect(log).toEqual(['start 20,0', 'drag 20,0', 'cancel'])
		})

		it('should cancel a drag whose release was lost', () => {
			press()
			move(20, 0)
			move(30, 0, { buttons: 0 })

			expect(log).toEqual(['start 20,0', 'drag 20,0', 'cancel'])
		})

		it('should take a new press as the end of one whose release was lost', () => {
			press()
			move(20, 0)
			press(100, 100)
			move(110, 100)

			expect(log).toEqual(['start 20,0', 'drag 20,0', 'cancel', 'start 10,0', 'drag 10,0'])
		})

		it('should forget a drag without reporting it when abandoned', () => {
			press()
			move(20, 0)
			controller.abandon()
			move(40, 0)
			release(40, 0)

			expect(log).toEqual(['start 20,0', 'drag 20,0'])
			expect(controller.dragging).toBe(false)
		})
	})

	describe('capturing the pointer', () => {
		it('should capture the pointer on its target only once the press has become a drag', () => {
			const capture = vi.spyOn(target, 'setPointerCapture').mockImplementation(() => { })
			vi.spyOn(target, 'hasPointerCapture').mockReturnValue(true)
			const releaseCapture = vi.spyOn(target, 'releasePointerCapture').mockImplementation(() => { })

			press()
			move(2, 0)
			expect(capture).not.toHaveBeenCalled()

			move(10, 0)
			expect(capture).toHaveBeenCalledWith(1)

			release(10, 0)
			expect(releaseCapture).toHaveBeenCalledWith(1)
		})

		it('should drag on even where the pointer cannot be captured', () => {
			vi.spyOn(target, 'setPointerCapture').mockImplementation(() => { throw new DOMException('No active pointer', 'NotFoundError') })

			press()
			move(10, 0)
			release(10, 0)

			expect(log).toEqual(['start 10,0', 'drag 10,0', 'end 10,0'])
		})
	})

	it('should follow its target when it changes', () => {
		const previous = target
		target = document.createElement('div')
		document.body.append(target)
		host.requestUpdate()

		previous.dispatchEvent(pointer('pointerdown', 0, 0))
		move(20, 0)
		expect(log).toEqual([])

		press()
		move(20, 0)
		expect(log).toEqual(['start 20,0', 'drag 20,0'])
		previous.remove()
	})
})

@component('pointer-drag-controller-test')
class PointerDragControllerTestComponent extends Component {
	readonly log = new Array<string>()

	readonly drag = new PointerDragController(this, host => ({
		handleDragStart: drag => host.log.push(report('start', drag)),
		handleDragCancel: () => host.log.push('cancel'),
	}))

	protected override get template() {
		return html`<slot></slot>`
	}
}

describe('PointerDragController on a component', () => {
	const fixture = new ComponentTestFixture(() => new PointerDragControllerTestComponent())

	it('should drag its host when given no target', () => {
		fixture.component.dispatchEvent(pointer('pointerdown', 0, 0))
		move(20, 0)

		expect(fixture.component.log).toEqual(['start 20,0'])
		release(20, 0)
	})

	it('should forget a drag in flight without reporting it when its host disconnects', () => {
		fixture.component.dispatchEvent(pointer('pointerdown', 0, 0))
		move(20, 0)
		fixture.component.remove()
		move(40, 0)

		expect(fixture.component.log).toEqual(['start 20,0'])
		expect(fixture.component.drag.dragging).toBe(false)
	})
})