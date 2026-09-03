import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/flex'
import { type Splitter } from './Splitter.js'
import { type SplitterItem } from './SplitterItem.js'
import { type SplitterResizerHost } from './SplitterResizerHost.js'
import './index.js'

type Direction = 'horizontal' | 'horizontal-reversed' | 'vertical' | 'vertical-reversed'

const directions: Array<Direction> = ['horizontal', 'horizontal-reversed', 'vertical', 'vertical-reversed']

/** The splitter is flex driven, so only settled sizes are meaningful. */
const settle = (milliseconds = 80) => new Promise(resolve => setTimeout(resolve, milliseconds))

const pollUntil = async (predicate: () => boolean, timeout = 2000) => {
	const start = Date.now()
	while (!predicate() && Date.now() - start < timeout) {
		await settle(30)
	}
	return predicate()
}

const isHorizontal = (direction: Direction) => direction.startsWith('horizontal')

const extentOf = (element: Element, direction: Direction) => {
	const { width, height } = element.getBoundingClientRect()
	return isHorizontal(direction) ? width : height
}

const resizerHostsOf = (splitter: Splitter) => [...splitter.renderRoot.querySelectorAll('mo-splitter-resizer-host')] as Array<SplitterResizerHost>

const pressResizer = (host: SplitterResizerHost) => host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }))
const releasePointer = () => window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }))
const movePointerTo = ({ x, y }: { x: number, y: number }) => window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: x, clientY: y }))

/** The coordinate which the splitter's direction dependent math must translate into "offset" pixels of the item. */
const pointAt = (item: SplitterItem, direction: Direction, offset: number) => {
	const { left, top, right, bottom } = item.getBoundingClientRect()
	switch (direction) {
		case 'horizontal':
			return { x: left + offset, y: top + 5 }
		case 'horizontal-reversed':
			return { x: right - offset, y: top + 5 }
		case 'vertical':
			return { x: left + 5, y: top + offset }
		case 'vertical-reversed':
			return { x: left + 5, y: bottom - offset }
	}
}

const size = 400

describe('Splitter', () => {
	describe('items', () => {
		const fixture = new ComponentTestFixture<Splitter>(html`
			<mo-splitter style='width: ${size}px; height: ${size}px'>
				<mo-splitter-item>
					<div>Pane 1</div>
				</mo-splitter-item>
				<mo-splitter-item>
					<div>Pane 2</div>
				</mo-splitter-item>
				<mo-splitter-item>
					<div>Pane 3</div>
				</mo-splitter-item>
				<div id='stray'>Stray</div>
			</mo-splitter>
		`)

		const appendItem = async () => {
			const item = document.createElement('mo-splitter-item')
			item.innerHTML = '<div>Pane 4</div>'
			fixture.component.appendChild(item)
			await settle()
			return item
		}

		it('should recognize only "mo-splitter-item" children as items (a stray div child is neither slotted as an item nor given a resizer)', () => {
			const stray = fixture.component.querySelector('#stray')!

			expect(fixture.component.items.length).toBe(3)
			expect(stray.assignedSlot).toBeNull()
			expect(resizerHostsOf(fixture.component).length).toBe(2)
		})

		it('should assign each item to its own indexed slot in order', () => {
			expect(fixture.component.items.map(item => item.slot)).toEqual(['item-0', 'item-1', 'item-2'])
			expect(fixture.component.items.map(item => item.assignedSlot?.name)).toEqual(['item-0', 'item-1', 'item-2'])
		})

		it('should adopt items added later and re-slot everything in order', async () => {
			await appendItem()

			expect(fixture.component.items.length).toBe(4)
			expect(fixture.component.items.map(item => item.assignedSlot?.name)).toEqual(['item-0', 'item-1', 'item-2', 'item-3'])
			expect(resizerHostsOf(fixture.component).length).toBe(3)
		})

		it('should drop the resizer of a removed item', async () => {
			fixture.component.items[1]!.remove()
			await settle()

			expect(fixture.component.items.length).toBe(2)
			expect(resizerHostsOf(fixture.component).length).toBe(1)
		})
	})

	describe('resizers', () => {
		const fixture = new ComponentTestFixture<Splitter>(html`
			<mo-splitter style='width: ${size}px; height: ${size}px'>
				<mo-splitter-item>
					<div>Pane 1</div>
				</mo-splitter-item>
				<mo-splitter-item>
					<div>Pane 2</div>
				</mo-splitter-item>
				<mo-splitter-item>
					<div>Pane 3</div>
				</mo-splitter-item>
			</mo-splitter>
		`)

		it('should place a resizer between every two items but none after the last (N items → N−1 resizer hosts)', () => {
			const flexChildren = [...fixture.component.renderRoot.querySelector('mo-flex')!.children]

			expect(resizerHostsOf(fixture.component).length).toBe(2)
			expect(flexChildren.at(-1)!.tagName).toBe('SLOT')
			expect((flexChildren.at(-1) as HTMLSlotElement).name).toBe('item-2')
		})

		it('should render the knob resizer by default', () => {
			expect(resizerHostsOf(fixture.component).map(host => host.resizerElement?.tagName))
				.toEqual(['MO-SPLITTER-RESIZER-KNOB', 'MO-SPLITTER-RESIZER-KNOB'])
		})

		it('should let "resizerTemplate" replace the resizer content', async () => {
			fixture.component.resizerTemplate = html`<mo-splitter-resizer-line></mo-splitter-resizer-line>`
			await settle()

			expect(resizerHostsOf(fixture.component).map(host => host.resizerElement?.tagName))
				.toEqual(['MO-SPLITTER-RESIZER-LINE', 'MO-SPLITTER-RESIZER-LINE'])
		})
	})

	describe('sizing', () => {
		for (const direction of directions) {
			describe(`in the "${direction}" direction`, () => {
				const fixture = new ComponentTestFixture<Splitter>(html`
					<mo-splitter direction=${direction} style='width: ${size}px; height: ${size}px'>
						<mo-splitter-item size='25%'>
							<div>Pane 1</div>
						</mo-splitter-item>
						<mo-splitter-item>
							<div>Pane 2</div>
						</mo-splitter-item>
					</mo-splitter>
				`)

				it('should give an item its declared "size" along the splitter axis', async () => {
					await settle()

					expect(extentOf(fixture.component.items[0]!, direction)).toBeCloseTo(size * 0.25, -1)
				})

				it('should let the last item absorb the remaining space', async () => {
					await settle()
					const resizerExtent = extentOf(resizerHostsOf(fixture.component)[0]!, direction)

					expect(extentOf(fixture.component.items[1]!, direction)).toBeCloseTo(size - size * 0.25 - resizerExtent, -1)
				})
			})
		}

		describe('without a declared size', () => {
			const fixture = new ComponentTestFixture<Splitter>(html`
				<mo-splitter style='width: ${size}px; height: ${size}px'>
					<mo-splitter-item size='100px'>
						<div>Pane 1</div>
					</mo-splitter-item>
					<mo-splitter-item>
						<div>Pane 2</div>
					</mo-splitter-item>
					<mo-splitter-item>
						<div>Pane 3</div>
					</mo-splitter-item>
				</mo-splitter>
			`)

			it('should size an item without a declared size to its content and let it flex', async () => {
				await settle()
				const [, second, third] = fixture.component.items
				const resizersExtent = resizerHostsOf(fixture.component).reduce((sum, host) => sum + extentOf(host, 'vertical'), 0)

				expect(extentOf(second!, 'vertical')).toBeCloseTo(extentOf(third!, 'vertical'), -1)
				expect(extentOf(second!, 'vertical')).toBeCloseTo((size - 100 - resizersExtent) / 2, -1)
			})
		})

		describe('with a "min"', () => {
			const fixture = new ComponentTestFixture<Splitter>(html`
				<mo-splitter style='width: ${size}px; height: ${size}px'>
					<mo-splitter-item size='10%' min='150px'>
						<div>Pane 1</div>
					</mo-splitter-item>
					<mo-splitter-item>
						<div>Pane 2</div>
					</mo-splitter-item>
				</mo-splitter>
			`)

			it('should not let an item shrink below its "min"', async () => {
				await settle()

				expect(extentOf(fixture.component.items[0]!, 'vertical')).toBeCloseTo(150, -1)
			})
		})
	})

	describe('collapsed items', () => {
		const fixture = new ComponentTestFixture<Splitter>(html`
			<mo-splitter style='width: ${size}px; height: ${size}px'>
				<mo-splitter-item size='50%'>
					<div></div>
				</mo-splitter-item>
				<mo-splitter-item>
					<div></div>
				</mo-splitter-item>
			</mo-splitter>
		`)

		const collapse = async (collapsed: boolean) => {
			fixture.component.items[0]!.collapsed = collapsed
			await fixture.updateComplete
			// The resizer host transitions "all" over 250ms, and visibility only flips at the very end of it.
			const visibility = collapsed ? 'collapse' : 'visible'
			await pollUntil(() => getComputedStyle(resizerHostsOf(fixture.component)[0]!).visibility === visibility)
			await settle()
		}

		it('should shrink a collapsed item to its content minimum (measured)', async () => {
			await settle()
			const expanded = extentOf(fixture.component.items[0]!, 'vertical')

			await collapse(true)

			expect(expanded).toBeCloseTo(size * 0.5, -1)
			expect(extentOf(fixture.component.items[0]!, 'vertical')).toBeLessThanOrEqual(1)
		})

		it('should hide the adjacent resizer without removing it from the DOM', async () => {
			await collapse(true)
			const resizer = resizerHostsOf(fixture.component)[0]!

			expect(resizer.isConnected).toBeTrue()
			expect(getComputedStyle(resizer).visibility).toBe('collapse')
			expect(getComputedStyle(resizer).pointerEvents).toBe('none')
		})

		it('should restore the declared size when expanded again (measured)', async () => {
			await collapse(true)

			await collapse(false)

			expect(extentOf(fixture.component.items[0]!, 'vertical')).toBeCloseTo(size * 0.5, -1)
		})
	})

	describe('drag resizing', () => {
		describe('state', () => {
			const fixture = new ComponentTestFixture<Splitter>(html`
				<mo-splitter style='width: ${size}px; height: ${size}px'>
					<mo-splitter-item size='25%'>
						<div>Pane 1</div>
					</mo-splitter-item>
					<mo-splitter-item>
						<div>Pane 2</div>
					</mo-splitter-item>
				</mo-splitter>
			`)

			it('should enter the resizing state on mousedown on a resizer (reflected "resizing" attribute)', async () => {
				pressResizer(resizerHostsOf(fixture.component)[0]!)
				await fixture.updateComplete

				expect(fixture.component.hasAttribute('resizing')).toBeTrue()
			})

			it('should ignore pointer movement while no resize is active', async () => {
				movePointerTo(pointAt(fixture.component.items[0]!, 'vertical', 350))
				await settle()

				expect(fixture.component.items[0]!.size).toBe('25%')
				expect(extentOf(fixture.component.items[0]!, 'vertical')).toBeCloseTo(size * 0.25, -1)
			})

			it('should stop resizing on mouseup anywhere on the window', async () => {
				pressResizer(resizerHostsOf(fixture.component)[0]!)
				await fixture.updateComplete

				releasePointer()
				await fixture.updateComplete

				expect(fixture.component.hasAttribute('resizing')).toBeFalse()
				expect(resizerHostsOf(fixture.component)[0]!.resizing).toBeFalse()
			})

			it('should suspend pointer interaction with pane content while resizing (computed pointer-events: none on the host)', async () => {
				pressResizer(resizerHostsOf(fixture.component)[0]!)
				await fixture.updateComplete

				expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
			})
		})

		for (const direction of directions) {
			describe(`in the "${direction}" direction`, () => {
				const fixture = new ComponentTestFixture<Splitter>(html`
					<mo-splitter direction=${direction} style='width: ${size}px; height: ${size}px'>
						<mo-splitter-item size='25%'>
							<div>Pane 1</div>
						</mo-splitter-item>
						<mo-splitter-item>
							<div>Pane 2</div>
						</mo-splitter-item>
					</mo-splitter>
				`)

				it('should resize the item to the pointer position as a percentage of the splitter', async () => {
					await settle()
					const item = fixture.component.items[0]!

					pressResizer(resizerHostsOf(fixture.component)[0]!)
					movePointerTo(pointAt(item, direction, size * 0.5))
					await settle()
					releasePointer()

					expect(parseFloat(item.size!)).toBeCloseTo(50, 0)
					expect(extentOf(item, direction)).toBeCloseTo(size * 0.5, -1)
				})
			})
		}
	})
})

describe('SplitterItem', () => {
	const fixture = new ComponentTestFixture<Splitter>(html`
		<mo-splitter style='width: ${size}px; height: ${size}px'>
			<mo-splitter-item size='50%'>
				<div id='content'>Pane 1</div>
			</mo-splitter-item>
			<mo-splitter-item>
				<div>Pane 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`)

	const item = () => fixture.component.items[0]!
	const content = () => fixture.component.querySelector<HTMLElement>('#content')!

	it('should let its first slotted child fill the pane (measured: 100% of the pane on both axes)', async () => {
		await settle()

		expect(content().getBoundingClientRect().width).toBeCloseTo(item().getBoundingClientRect().width, -1)
		expect(content().getBoundingClientRect().height).toBeCloseTo(item().getBoundingClientRect().height, -1)
		expect(content().getBoundingClientRect().height).toBeCloseTo(size * 0.5, -1)
	})

	it('should clip pane content which overflows the pane', async () => {
		content().style.width = '1000px'
		await settle()

		expect(getComputedStyle(item()).overflow).toBe('hidden')
		expect(item().getBoundingClientRect().width).toBeCloseTo(size, -1)
		expect(item().scrollWidth).toBeGreaterThanOrEqual(1000)
	})

	it('should relay out the splitter when its "size" changes after the fact (measured settled size)', async () => {
		await settle()

		item().size = '25%'
		await settle()

		expect(item().getBoundingClientRect().height).toBeCloseTo(size * 0.25, -1)
	})
})