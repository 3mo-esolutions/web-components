import { type ReactiveController } from '@a11d/lit'
import { SwipeabilityController, type SwipeabilityAxis, type SwipeabilityDirection } from './SwipeabilityController.js'

class FakeHost {
	private readonly controllers = new Set<ReactiveController>()
	addController(controller: ReactiveController) { this.controllers.add(controller) }
	removeController(controller: ReactiveController) { this.controllers.delete(controller) }
	requestUpdate() { this.controllers.forEach(controller => controller.hostUpdated?.()) }
	get updateComplete() { return Promise.resolve(true) }
}

describe('SwipeabilityController', () => {
	let host: FakeHost
	let surface: HTMLElement
	let controller: SwipeabilityController
	let moves: Array<number>
	let ends: Array<{ detent: number, offset: number }>
	let starts: number
	let detents: Array<number>
	let detent: number | undefined
	let axis: SwipeabilityAxis
	let direction: SwipeabilityDirection
	let threshold: number | undefined
	let disabled: boolean

	beforeEach(() => {
		surface = document.createElement('div')
		Object.assign(surface.style, { inlineSize: '200px', blockSize: '200px' })
		document.body.append(surface)
		moves = []
		ends = []
		starts = 0
		detents = [0, 200]
		detent = undefined
		axis = 'block'
		direction = 'end'
		threshold = undefined
		disabled = false
		host = new FakeHost()
		controller = new SwipeabilityController(host, {
			get surface() { return surface },
			get axis() { return axis },
			get direction() { return direction },
			get detents() { return detents },
			get detent() { return detent },
			get threshold() { return threshold },
			get disabled() { return disabled },
			handleSwipeStart: () => starts++,
			handleSwipe: offset => moves.push(offset),
			handleSwipeEnd: (chosen, offset) => ends.push({ detent: chosen, offset }),
		})
		host.requestUpdate()
	})

	afterEach(() => {
		controller.abandon()
		surface.remove()
	})

	const pointer = (type: string, along: number, timeStamp = 0, across = 0) => {
		const [x, y] = axis === 'block' ? [across, along] : [along, across]
		return Object.defineProperty(
			new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, isPrimary: true, bubbles: true, composed: true }),
			'timeStamp', { value: timeStamp }
		)
	}

	const swipe = (positions: Array<number>, { timeStep = 100 } = {}) => {
		surface.dispatchEvent(pointer('pointerdown', 0))
		let time = 0
		for (const position of positions) {
			time += timeStep
			window.dispatchEvent(pointer('pointermove', position, time))
		}
		window.dispatchEvent(pointer('pointerup', positions.at(-1) ?? 0, time + timeStep))
	}

	it('should stamp its state onto the surface', () => {
		expect(surface.dataset.swipeability).toBe('idle')

		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 40, 100))
		expect(surface.dataset.swipeability).toBe('swiping')

		window.dispatchEvent(pointer('pointerup', 40, 200))
		expect(surface.dataset.swipeability).toBe('idle')
	})

	it('should report offsets only once the gesture has left its dead zone', () => {
		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 2, 50))

		expect(starts).toBe(0)
		expect(moves).toEqual([])

		window.dispatchEvent(pointer('pointermove', 40, 100))

		expect(starts).toBe(1)
		expect(moves).toEqual([40])
	})

	it('should return to the detent it started from when released short of the threshold', () => {
		swipe([10, 20])

		expect(ends).toEqual([{ detent: 0, offset: 20 }])
	})

	it('should commit to the next detent once a quarter of the way there', () => {
		swipe([20, 60])

		expect(ends[0]?.detent).toBe(200)
	})

	it('should honour a threshold of its own', () => {
		threshold = 0.75
		swipe([20, 60])

		expect(ends[0]?.detent).toBe(0)
	})

	it('should commit on a flick which falls short of the threshold', () => {
		swipe([10, 30], { timeStep: 16 })

		expect(ends[0]?.detent).toBe(200)
	})

	it('should return to the start when the flick reverses out of a committed distance', () => {
		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 120, 100))
		window.dispatchEvent(pointer('pointermove', 60, 120))
		window.dispatchEvent(pointer('pointerup', 60, 130))

		expect(ends[0]?.detent).toBe(0)
	})

	it('should not mistake a slow drag reported in rapid samples for a flick', () => {
		swipe([4, 8, 12, 16, 20], { timeStep: 2 })

		expect(ends[0]?.detent).toBe(0)
	})

	it('should not treat a release after holding still as a flick', () => {
		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 10, 10))
		window.dispatchEvent(pointer('pointermove', 30, 30))
		window.dispatchEvent(pointer('pointerup', 30, 400))

		expect(ends[0]?.detent).toBe(0)
	})

	it('should swipe back out of the detent it currently sits at', () => {
		detent = 200
		swipe([-80])

		expect(moves[0]).toBe(120)
		expect(ends[0]?.detent).toBe(0)
	})

	it('should carry the next gesture on from the detent it last settled at', () => {
		swipe([20, 60])
		expect(ends[0]?.detent).toBe(200)

		moves.length = 0
		swipe([-20, -80])

		expect(moves[0]).toBe(180)
		expect(ends[1]?.detent).toBe(0)
	})

	it('should let a detent of its own override what it last settled at', () => {
		detent = 0
		swipe([20, 60])
		expect(ends[0]?.detent).toBe(200)

		moves.length = 0
		swipe([20])

		expect(moves[0]).toBe(20)
	})

	it('should stop at the detent between the two it swipes across', () => {
		detents = [0, 100, 200]
		swipe([40, 90])

		expect(ends[0]?.detent).toBe(100)
	})

	it('should damp a pull beyond the outermost detents rather than clamp it', () => {
		swipe([-30])

		expect(moves[0]).toBe(-10)
	})

	it('should leave a gesture which runs across its axis to whatever scrolls there', () => {
		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 3, 100, 40))

		expect(moves).toEqual([])
		expect(surface.dataset.swipeability).toBe('idle')
	})

	it('should leave the gesture to content which can still scroll the way the finger goes', () => {
		const scroller = document.createElement('div')
		Object.assign(scroller.style, { blockSize: '50px', overflow: 'auto' })
		scroller.innerHTML = '<div style="block-size: 400px"></div>'
		surface.append(scroller)
		scroller.scrollTop = 100

		scroller.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 60, 100))

		expect(moves).toEqual([])
	})

	it('should take the gesture from content which has no room left to scroll', () => {
		const scroller = document.createElement('div')
		Object.assign(scroller.style, { blockSize: '50px', overflow: 'auto' })
		scroller.innerHTML = '<div style="block-size: 400px"></div>'
		surface.append(scroller)

		scroller.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 60, 100))

		expect(moves).toEqual([60])
	})

	it('should follow the writing direction on the inline axis', () => {
		axis = 'inline'
		direction = 'start'
		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', -40, 100))

		expect(moves).toEqual([40])
	})

	it('should stay at the detent it started from when the browser takes the gesture over', () => {
		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 150, 100))
		window.dispatchEvent(pointer('pointercancel', 150, 120))

		expect(ends).toEqual([{ detent: 0, offset: 150 }])
	})

	it('should refuse to swipe while disabled', () => {
		disabled = true

		surface.dispatchEvent(pointer('pointerdown', 0))
		window.dispatchEvent(pointer('pointermove', 60, 100))

		expect(moves).toEqual([])
	})

	describe('claiming the touch from the browser', () => {
		const touchmove = (target: HTMLElement, along: number, across = 0) => {
			if (typeof Touch === 'undefined') {
				return undefined
			}
			const [x, y] = axis === 'block' ? [across, along] : [along, across]
			const event = new TouchEvent('touchmove', {
				touches: [new Touch({ identifier: 1, target, clientX: x, clientY: y })],
				cancelable: true, bubbles: true,
			})
			window.dispatchEvent(event)
			return event
		}

		it('should claim a gesture which runs along its axis', () => {
			surface.dispatchEvent(pointer('pointerdown', 0))
			const event = touchmove(surface, 40)
			if (!event) {
				pending('the engine has no touch events')
			}

			expect(event?.defaultPrevented).toBe(true)
		})

		it('should leave a gesture which runs across its axis to the browser', () => {
			surface.dispatchEvent(pointer('pointerdown', 0))
			const event = touchmove(surface, 3, 40)
			if (!event) {
				pending('the engine has no touch events')
			}

			expect(event?.defaultPrevented).toBe(false)
		})
	})
})