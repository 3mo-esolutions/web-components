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

	const press = (type: 'mousedown' | 'touchstart' = 'mousedown') => fixture.component.dispatchEvent(new Event(type, { bubbles: true, composed: true }))
	const release = (type: 'mouseup' | 'touchend' = 'mouseup') => window.dispatchEvent(new Event(type, { bubbles: true, composed: true }))

	it('should dispatch "resizeStart" on mousedown and "resizeStop" on mouseup anywhere on the window', () => {
		const start = jasmine.createSpy('resizeStart')
		const stop = jasmine.createSpy('resizeStop')
		fixture.component.addEventListener('resizeStart', start)
		fixture.component.addEventListener('resizeStop', stop)

		press()
		expect(start).toHaveBeenCalledTimes(1)
		expect(stop).not.toHaveBeenCalled()

		release()
		expect(stop).toHaveBeenCalledTimes(1)
	})

	it('should start and stop resizing from touch events as well (touchstart / window touchend)', () => {
		press('touchstart')
		expect(fixture.component.resizing).toBeTrue()

		release('touchend')
		expect(fixture.component.resizing).toBeFalse()
	})

	it('should forward its direction to the slotted resizer ("hostDirection")', async () => {
		expect(resizer().hostDirection).toBe('vertical')

		fixture.component.direction = 'horizontal-reversed'
		await fixture.updateComplete

		expect(resizer().hostDirection).toBe('horizontal-reversed')
	})

	it('should mark the slotted resizer while resizing ("hostResizing" set on mousedown, cleared on mouseup)', () => {
		press()
		expect(resizer().hostResizing).toBeTrue()

		release()
		expect(resizer().hostResizing).toBeFalse()
	})

	it('should mark the slotted resizer while hovered ("hostHover" on pointerenter, cleared on pointerleave)', () => {
		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		expect(resizer().hostHover).toBeTrue()

		fixture.component.dispatchEvent(new PointerEvent('pointerleave'))
		expect(resizer().hostHover).toBeFalse()
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