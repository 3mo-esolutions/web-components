import { html, type HTMLTemplateResult } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Timeline } from './Timeline.js'
import './index.js'

const settle = (milliseconds = 80) => new Promise(resolve => setTimeout(resolve, milliseconds))

const width = 600

describe('TimelineItem', () => {
	describe('meta', () => {
		const fixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px'>
				<mo-timeline-item meta='2024'>Item 1</mo-timeline-item>
				<mo-timeline-item meta='2025'><span slot='meta'>Custom</span>Item 2</mo-timeline-item>
				<mo-timeline-item>Item 3</mo-timeline-item>
			</mo-timeline>
		`)

		const metaSlotOf = (index: number) => fixture.component.items[index]!.renderRoot.querySelector<HTMLSlotElement>('slot[name=meta]')

		it('should render the "meta" attribute', async () => {
			await settle()
			const slot = metaSlotOf(0)!

			expect(slot.textContent).toContain('2024')
			expect(slot.getBoundingClientRect().width).toBeGreaterThan(0)
		})

		it('should let the "meta" slot supersede the attribute', async () => {
			await settle()
			const slot = metaSlotOf(1)!

			expect(slot.assignedElements().map(element => element.textContent)).toEqual(['Custom'])
			expect(slot.querySelector('span')!.getBoundingClientRect().width).toBe(0)
		})

		it('should report "hasMeta" from either source and not otherwise', async () => {
			await settle()

			expect(fixture.component.items.map(item => item.hasMeta)).toEqual([true, true, false])
			expect(metaSlotOf(2)).toBeNull()
		})
	})

	describe('icon', () => {
		const fixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px'>
				<mo-timeline-item>Item 1</mo-timeline-item>
				<mo-timeline-item><span slot='icon' style='display: block; width: 20px; height: 20px'>*</span>Item 2</mo-timeline-item>
			</mo-timeline>
		`)

		it('should show a bullet point by default', async () => {
			await settle()
			const bullet = fixture.component.items[0]!.renderRoot.querySelector('.bullet-point')!

			expect(bullet.getBoundingClientRect().width).toBeCloseTo(10, 0)
			expect(bullet.getBoundingClientRect().height).toBeCloseTo(10, 0)
		})

		it('should let the "icon" slot replace the bullet', async () => {
			await settle()
			const item = fixture.component.items[1]!
			const iconSlot = item.renderRoot.querySelector<HTMLSlotElement>('slot[name=icon]')!

			expect(iconSlot.assignedElements().map(element => element.textContent)).toEqual(['*'])
			expect(item.renderRoot.querySelector('.bullet-point')!.getBoundingClientRect().width).toBe(0)
		})
	})

	describe('connecting lines', () => {
		const fixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px'>
				<mo-timeline-item>Item 1</mo-timeline-item>
				<mo-timeline-item>Item 2</mo-timeline-item>
				<mo-timeline-item>Item 3</mo-timeline-item>
			</mo-timeline>
		`)

		const customLineFixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px'>
				<mo-timeline-item .line=${(defaultLine?: HTMLTemplateResult) => html`<div class='custom-line'>${defaultLine}</div>`}>Item 1</mo-timeline-item>
				<mo-timeline-item>Item 2</mo-timeline-item>
				<mo-timeline-item>Item 3</mo-timeline-item>
			</mo-timeline>
		`)

		it('should not draw a leading line before the first item', async () => {
			await settle()

			expect(fixture.component.items[0]!.renderRoot.querySelector('.leading .line')).toBeNull()
		})

		it('should not draw a trailing line after the last item', async () => {
			await settle()

			expect(fixture.component.items[2]!.renderRoot.querySelector('.trailing .line')).toBeNull()
		})

		it('should draw the line between two items (middle item has both segments)', async () => {
			await settle()
			const middle = fixture.component.items[1]!

			expect(middle.renderRoot.querySelector('.leading .line')).not.toBeNull()
			expect(middle.renderRoot.querySelector('.trailing .line')).not.toBeNull()
		})

		it('should let the "line" property replace its line, handing it the default template', async () => {
			await settle()
			const first = customLineFixture.component.items[0]!

			expect(first.renderRoot.querySelector('.trailing .custom-line')).not.toBeNull()
			expect(first.renderRoot.querySelector('.trailing .custom-line .line')).not.toBeNull()
		})

		it('should extend an item\'s custom line into the next item\'s leading segment', async () => {
			await settle()
			const [first, second, third] = customLineFixture.component.items

			expect(first!.renderRoot.querySelector('.trailing .custom-line')).not.toBeNull()
			expect(second!.renderRoot.querySelector('.leading .custom-line')).not.toBeNull()
			expect(third!.renderRoot.querySelector('.leading .custom-line')).toBeNull()
		})
	})

	describe('customization', () => {
		const fixture = new ComponentTestFixture<Timeline>(html`
			<mo-timeline style='width: ${width}px; --mo-timeline-item-bullet-color: rgb(1, 2, 3); --mo-timeline-item-padding-end: 40px'>
				<mo-timeline-item>Item 1</mo-timeline-item>
				<mo-timeline-item>Item 2</mo-timeline-item>
				<mo-timeline-item>Item 3</mo-timeline-item>
			</mo-timeline>
		`)

		const contentSlotOf = (index: number) => fixture.component.items[index]!.renderRoot.querySelector('slot:not([name])')!

		it('should color the bullet via "--mo-timeline-item-bullet-color"', async () => {
			await settle()
			const bullet = fixture.component.items[0]!.renderRoot.querySelector('.bullet-point')!

			expect(getComputedStyle(bullet).backgroundColor).toBe('rgb(1, 2, 3)')
		})

		it('should pad items apart via "--mo-timeline-item-padding-end", except after the last item', async () => {
			await settle()

			expect(getComputedStyle(contentSlotOf(0)).paddingBottom).toBe('40px')
			expect(getComputedStyle(contentSlotOf(1)).paddingBottom).toBe('40px')
			expect(getComputedStyle(contentSlotOf(2)).paddingBottom).toBe('0px')
		})
	})
})