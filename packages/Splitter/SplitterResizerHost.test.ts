import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SplitterResizerHost } from './SplitterResizerHost.js'
import './index.js'

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

const pollUntil = async (predicate: () => boolean, timeout = 2000) => {
	const start = Date.now()
	while (!predicate() && Date.now() - start < timeout) {
		await wait(30)
	}
	return predicate()
}

describe('SplitterResizerHost', () => {
	const fixture = new ComponentTestFixture<SplitterResizerHost>(html`
		<mo-splitter-resizer-host direction='vertical' style='width: 200px; height: 20px'>
			<mo-splitter-resizer-knob></mo-splitter-resizer-knob>
		</mo-splitter-resizer-host>
	`)

	const resizer = () => fixture.component.resizerElement!

	const pointer = (type: string, init: PointerEventInit = {}) =>
		new PointerEvent(type, { bubbles: true, composed: true, pointerId: 1, isPrimary: true, buttons: type === 'pointerup' ? 0 : 1, ...init })

	const press = (pointerType = 'mouse') => fixture.component.dispatchEvent(pointer('pointerdown', { pointerType }))
	const move = (x: number, y: number) => window.dispatchEvent(pointer('pointermove', { clientX: x, clientY: y }))
	const release = () => window.dispatchEvent(pointer('pointerup'))

	afterEach(() => {
		release()
	})

	it('should dispatch "resizeStart" when pressed and "resizeStop" when released anywhere on the window', () => {
		const start = vi.fn()
		const stop = vi.fn()
		fixture.component.addEventListener('resizeStart', start)
		fixture.component.addEventListener('resizeStop', stop)

		press()
		expect(start).toHaveBeenCalledTimes(1)
		expect(stop).not.toHaveBeenCalled()

		release()
		expect(stop).toHaveBeenCalledTimes(1)
	})

	it('should resize from a touch as well', () => {
		press('touch')
		expect(fixture.component.resizing).toBe(true)

		release()
		expect(fixture.component.resizing).toBe(false)
	})

	it('should report where the pointer is while resizing ("resize"), and nothing once released', () => {
		const resize = vi.fn()
		fixture.component.addEventListener('resize', resize)

		press()
		move(30, 40)
		release()
		move(50, 60)

		expect(resize).toHaveBeenCalledTimes(1)
		expect((resize.mock.lastCall![0] as CustomEvent).detail).toEqual({ x: 30, y: 40 })
	})

	it('should stop resizing when the browser takes the pointer over', () => {
		const stop = vi.fn()
		fixture.component.addEventListener('resizeStop', stop)

		press('touch')
		window.dispatchEvent(pointer('pointercancel'))

		expect(fixture.component.resizing).toBe(false)
		expect(stop).toHaveBeenCalledTimes(1)
	})

	it('should forward its direction to the slotted resizer ("hostDirection")', async () => {
		expect(resizer().hostDirection).toBe('vertical')

		fixture.component.direction = 'horizontal-reversed'
		await fixture.updateComplete

		expect(resizer().hostDirection).toBe('horizontal-reversed')
	})

	it('should mark the slotted resizer while resizing ("hostResizing" set when pressed, cleared when released)', () => {
		press()
		expect(resizer().hostResizing).toBe(true)

		release()
		expect(resizer().hostResizing).toBe(false)
	})

	it('should mark the slotted resizer while hovered ("hostHover" on pointerenter, cleared on pointerleave)', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		expect(resizer().hostHover).toBe(true)

		fixture.component.dispatchEvent(new PointerEvent('pointerleave'))
		expect(resizer().hostHover).toBe(false)
	})

	describe('resize cursor', () => {
		const cursorByDirection = new Map<SplitterResizerHost['direction'], string>([
			['horizontal', 'col-resize'],
			['horizontal-reversed', 'col-resize'],
			['vertical', 'row-resize'],
			['vertical-reversed', 'row-resize'],
		])

		for (const [direction, cursor] of cursorByDirection) {
			it(`should show a resize cursor matching its axis (${direction} → ${cursor})`, async () => {
				fixture.component.direction = direction
				await fixture.updateComplete

				expect(getComputedStyle(fixture.component).cursor).toBe(cursor)
			})
		}
	})

	it('should become invisible and inert when collapsed (computed visibility and pointer-events)', async () => {
		expect(getComputedStyle(fixture.component).visibility).toBe('visible')

		fixture.component.collapsed = true
		await fixture.updateComplete
		// The host transitions "all" over 250ms and visibility only flips at the very end of it.
		await pollUntil(() => getComputedStyle(fixture.component).visibility === 'collapse')

		expect(getComputedStyle(fixture.component).visibility).toBe('collapse')
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})
})