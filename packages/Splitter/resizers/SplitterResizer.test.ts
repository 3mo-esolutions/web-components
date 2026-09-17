import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SplitterResizerHost } from '../SplitterResizerHost.js'
import { type SplitterResizer } from './SplitterResizer.js'
import '../index.js'

type Direction = 'horizontal' | 'horizontal-reversed' | 'vertical' | 'vertical-reversed'

/**
 * Both resizers transition every property they change, and a frame the runner has backgrounded does
 * not advance transitions at all — so waiting out a duration proves nothing. These expectations are
 * about the settled state, which applies at once with the transition switched off.
 */
const settled = async (resizer: SplitterResizer) => {
	resizer.style.transition = 'none'
	await resizer.updateComplete
}

const idleColor = 'rgb(10, 20, 30)'
const activeColor = 'rgb(1, 2, 3)'

const hostSize = 200

/** The resizers are sized in rem, which is not 16px everywhere. */
const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize)

describe('SplitterResizerKnob', () => {
	const fixture = new ComponentTestFixture<SplitterResizerHost>(html`
		<mo-splitter-resizer-host style='width: ${hostSize}px; height: ${hostSize}px; --mo-splitter-resizer-knob-background: ${idleColor}; --mo-splitter-resizer-knob-active-background: ${activeColor}'>
			<mo-splitter-resizer-knob></mo-splitter-resizer-knob>
		</mo-splitter-resizer-host>
	`)

	const knob = () => fixture.component.resizerElement as SplitterResizer

	const orient = async (direction: Direction) => {
		await settled(knob())
		knob().hostHover = false
		knob().hostResizing = false
		knob().hostDirection = direction
		await settled(knob())
		return knob().getBoundingClientRect()
	}

	const breadthByDirection = new Map<Direction, 'width' | 'height'>([
		['vertical', 'width'],
		['vertical-reversed', 'width'],
		['horizontal', 'height'],
		['horizontal-reversed', 'height'],
	])

	for (const [direction, breadth] of breadthByDirection) {
		it(`should orient itself across the splitter axis (${direction} → 2rem of ${breadth})`, async () => {
			const rect = await orient(direction)

			expect(rect[breadth]).toBeCloseTo(2 * rem(), -1)
			expect(rect[breadth === 'width' ? 'height' : 'width']).toBeCloseTo(0.375 * rem(), 0)
		})
	}

	it('should highlight while hovered or resizing', async () => {
		await orient('vertical')
		expect(getComputedStyle(knob()).backgroundColor).toBe(idleColor)

		knob().hostHover = true
		await settled(knob())
		expect(getComputedStyle(knob()).backgroundColor).toBe(activeColor)

		knob().hostHover = false
		knob().hostResizing = true
		await settled(knob())
		expect(getComputedStyle(knob()).backgroundColor).toBe(activeColor)
	})
})

describe('SplitterResizerLine', () => {
	const fixture = new ComponentTestFixture<SplitterResizerHost>(html`
		<mo-splitter-resizer-host style='width: ${hostSize}px; height: ${hostSize}px; --mo-splitter-resizer-line-idle-background: ${idleColor}; --mo-splitter-resizer-line-accent-color: ${activeColor}'>
			<mo-splitter-resizer-line></mo-splitter-resizer-line>
		</mo-splitter-resizer-host>
	`)

	const line = () => fixture.component.resizerElement as SplitterResizer

	const orient = async (direction: Direction) => {
		await settled(line())
		line().hostHover = false
		line().hostResizing = false
		line().hostDirection = direction
		await settled(line())
		return line().getBoundingClientRect()
	}

	const breadthByDirection = new Map<Direction, 'width' | 'height'>([
		['vertical', 'width'],
		['vertical-reversed', 'width'],
		['horizontal', 'height'],
		['horizontal-reversed', 'height'],
	])

	for (const [direction, breadth] of breadthByDirection) {
		it(`should span the full breadth across the splitter axis (${direction} → full ${breadth})`, async () => {
			const rect = await orient(direction)

			expect(rect[breadth]).toBeCloseTo(hostSize, -1)
			expect(rect[breadth === 'width' ? 'height' : 'width']).toBeCloseTo(0.125 * rem(), 0)
		})
	}

	it('should highlight while hovered or resizing', async () => {
		await orient('vertical')
		expect(getComputedStyle(line()).backgroundColor).toBe(idleColor)

		line().hostHover = true
		await settled(line())
		expect(getComputedStyle(line()).backgroundColor).toBe(activeColor)

		line().hostHover = false
		line().hostResizing = true
		await settled(line())
		expect(getComputedStyle(line()).backgroundColor).toBe(activeColor)
	})
})