import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Timeline } from './Timeline.js'
import './index.js'

const settle = (milliseconds = 80) => new Promise(resolve => setTimeout(resolve, milliseconds))

const width = 600

/**
 * Items always span three tracks, so the implicit third track exists either way and is reported
 * by both engines. Only the tracks which actually take space tell whether a lane is reserved.
 */
const occupiedTracks = (timeline: Timeline, axis: 'columns' | 'rows') =>
	getComputedStyle(timeline)
		.getPropertyValue(`grid-template-${axis}`)
		.split(' ')
		.filter(track => parseFloat(track) > 0)

describe('Timeline', () => {
	const fixture = new ComponentTestFixture<Timeline>(html`
		<mo-timeline style='width: ${width}px'>
			<mo-timeline-item>Item 1</mo-timeline-item>
			<mo-timeline-item>Item 2</mo-timeline-item>
		</mo-timeline>
	`)

	it('should default to the vertical direction and reflect it', () => {
		expect(fixture.component.direction).toBe('vertical')
		expect(fixture.component.getAttribute('direction')).toBe('vertical')
	})

	describe('Property "direction"', () => {
		for (const direction of ['vertical', 'horizontal'] as const) {
			it(`should propagate to its items as an attribute (${direction})`, async () => {
				fixture.component.direction = direction
				await fixture.updateComplete

				expect(fixture.component.items.length).toBe(2)
				expect(fixture.component.items.map(item => item.getAttribute('direction'))).toEqual([direction, direction])
			})
		}

		it('should propagate to items slotted later', async () => {
			fixture.component.direction = 'horizontal'
			await fixture.updateComplete

			const item = document.createElement('mo-timeline-item')
			item.textContent = 'Item 3'
			fixture.component.appendChild(item)
			await settle()

			expect(fixture.component.items.length).toBe(3)
			expect(item.getAttribute('direction')).toBe('horizontal')
		})
	})

	describe('items', () => {
		const strayFixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px'>
				<mo-timeline-item>Item 1</mo-timeline-item>
				<div id='stray'>Stray</div>
				<mo-timeline-item>Item 2</mo-timeline-item>
			</mo-timeline>
		`)

		it('should include only timeline items (a stray slotted div is ignored)', () => {
			expect(strayFixture.component.children.length).toBe(3)
			expect(strayFixture.component.items.length).toBe(2)
			expect(strayFixture.component.items.map(item => item.tagName)).toEqual(['MO-TIMELINE-ITEM', 'MO-TIMELINE-ITEM'])
		})
	})

	describe('meta lane', () => {
		const metaAttributeFixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px'>
				<mo-timeline-item meta='2024'>Item 1</mo-timeline-item>
				<mo-timeline-item>Item 2</mo-timeline-item>
			</mo-timeline>
		`)

		const metaSlotFixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px'>
				<mo-timeline-item><span slot='meta'>2024</span>Item 1</mo-timeline-item>
				<mo-timeline-item>Item 2</mo-timeline-item>
			</mo-timeline>
		`)

		it('should reserve a meta lane once any item declares meta', async () => {
			await settle()

			for (const timeline of [metaAttributeFixture.component, metaSlotFixture.component]) {
				expect(timeline.hasAttribute('has-meta')).toBeTrue()
				expect(occupiedTracks(timeline, 'columns').length).toBe(3)
			}
		})

		it('should not reserve one while no item has meta', async () => {
			await settle()

			expect(fixture.component.hasAttribute('has-meta')).toBeFalse()
			expect(occupiedTracks(fixture.component, 'columns').length).toBe(2)
			expect(fixture.component.items[0]!.renderRoot.querySelector('slot[name=meta]')).toBeNull()
		})
	})

	describe('layout', () => {
		it('should stack items vertically in the vertical direction', async () => {
			await settle()
			const [first, second] = fixture.component.items.map(item => item.getBoundingClientRect())

			expect(first!.height).toBeGreaterThan(0)
			expect(second!.top).toBeGreaterThanOrEqual(first!.bottom - 1)
			expect(second!.left).toBeCloseTo(first!.left, -1)
		})

		it('should place items side by side in the horizontal direction', async () => {
			fixture.component.direction = 'horizontal'
			await fixture.updateComplete
			await settle()
			const [first, second] = fixture.component.items.map(item => item.getBoundingClientRect())

			expect(first!.width).toBeGreaterThan(0)
			expect(second!.left).toBeGreaterThanOrEqual(first!.right - 1)
			expect(second!.top).toBeCloseTo(first!.top, -1)
		})
	})
})