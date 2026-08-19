import { Component, component, css, html, property, query, style } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { OverflowController } from './OverflowController.js'

const itemWidth = 60

@component('overflow-test-component')
class OverflowTestComponent extends Component {
	@query('#container') readonly container!: HTMLDivElement

	@property({ type: Number }) containerWidth = 300
	@property({ type: Number }) gap = 0
	@property({ type: Number }) reservedSize = 0
	@property({ type: Number }) itemCount = 5
	@property({ type: Boolean }) concealed = false
	@property({ type: Number }) pinnedIndex = -1

	readonly updateCalls = new Array<[Element, boolean]>()

	readonly controller = new OverflowController(this, host => ({
		get container() { return host.container },
		get items() { return [...host.renderRoot?.querySelectorAll('.item') ?? []] },
		get reservedSize() { return host.reservedSize },
		isPinned: item => item.hasAttribute('data-pinned'),
		handleChange: (item, overflows) => {
			host.updateCalls.push([item, overflows])
			item.toggleAttribute('data-overflows', overflows)
		},
	}))

	get items() { return [...this.renderRoot.querySelectorAll('.item')] }
	get overflowedItems() { return this.items.filter(item => item.hasAttribute('data-overflows')) }

	static override get styles() {
		return css`
			#container {
				display: flex;
				overflow: clip;
			}

			.item {
				flex: 0 0 auto;
				width: ${itemWidth}px;
				height: 10px;
			}

			.item[data-overflows] {
				display: none;
			}
		`
	}

	protected override get template() {
		return html`
			<div id='container' ${style({
				width: `${this.containerWidth}px`,
				gap: `${this.gap}px`,
				display: this.concealed ? 'none' : undefined,
			})}>
				${new Array(this.itemCount).fill(undefined).map((_, index) => html`
					<div class='item' ?data-pinned=${index === this.pinnedIndex}></div>
				`)}
			</div>
		`
	}
}

/** Awaits the resize observations and microtask-batched measurements the controller settles through. */
const settle = async (component: OverflowTestComponent) => {
	for (let i = 0; i < 10; i++) {
		await component.updateComplete
		await new Promise(resolve => requestAnimationFrame(resolve))
	}
	await component.updateComplete
}

describe('OverflowController', () => {
	const fixture = new ComponentTestFixture(() => new OverflowTestComponent())

	beforeEach(async () => {
		await settle(fixture.component)
		fixture.component.updateCalls.length = 0
	})

	it('should not overflow items which fit the container', () => {
		expect(fixture.component.overflowedItems).toEqual([])
		expect(fixture.component.controller.hasOverflow).toBeFalse()
	})

	it('should apply the verdict of every newly encountered item once', async () => {
		const component = new OverflowTestComponent()
		document.body.appendChild(component)
		try {
			await settle(component)
			expect(component.updateCalls.map(([item, overflows]) => [component.items.indexOf(item), overflows]))
				.toEqual([[0, false], [1, false], [2, false], [3, false], [4, false]])
		} finally {
			component.remove()
		}
	})

	it('should overflow the items which do not fit from the end', async () => {
		fixture.component.containerWidth = itemWidth * 4 + 10

		await settle(fixture.component)

		expect(fixture.component.overflowedItems).toEqual([fixture.component.items[4]!])
		expect(fixture.component.controller.overflows(fixture.component.items[4]!)).toBeTrue()
		expect(fixture.component.controller.hasOverflow).toBeTrue()
	})

	it('should bring items back once they fit again, touching only those whose verdict changed', async () => {
		fixture.component.containerWidth = itemWidth + 10
		await settle(fixture.component)
		expect(fixture.component.overflowedItems.length).toBe(4)
		fixture.component.updateCalls.length = 0

		fixture.component.containerWidth = itemWidth * 5
		await settle(fixture.component)

		expect(fixture.component.overflowedItems).toEqual([])
		expect(fixture.component.updateCalls.map(([, overflows]) => overflows)).toEqual([false, false, false, false])
	})

	it('should account for the container\'s gap', async () => {
		fixture.component.gap = 10

		await settle(fixture.component)

		// 5 items à 60px + 4 gaps à 10px = 340px exceed 300px whereas 4 items + 3 gaps = 270px fit.
		expect(fixture.component.overflowedItems).toEqual([fixture.component.items[4]!])
	})

	it('should never overflow pinned items', async () => {
		fixture.component.pinnedIndex = 4
		fixture.component.containerWidth = itemWidth + 10

		await settle(fixture.component)

		expect(fixture.component.overflowedItems).toEqual(fixture.component.items.slice(0, 4))
	})

	it('should reserve the given size as soon as any item overflows', async () => {
		fixture.component.reservedSize = 50

		fixture.component.containerWidth = itemWidth * 5
		await settle(fixture.component)
		// All 5 items fit without any reservation.
		expect(fixture.component.overflowedItems).toEqual([])

		fixture.component.containerWidth = itemWidth * 5 - 20
		await settle(fixture.component)
		// 5 items no longer fit, and with the reservation in place neither do 4: 4 * 60px + 50px = 290px exceed 280px.
		expect(fixture.component.overflowedItems).toEqual(fixture.component.items.slice(3))
	})

	it('should overflow all items of a hidden container and restore them once it shows again', async () => {
		fixture.component.concealed = true
		await settle(fixture.component)
		expect(fixture.component.overflowedItems.length).toBe(5)

		fixture.component.concealed = false
		await settle(fixture.component)
		expect(fixture.component.overflowedItems).toEqual([])
	})

	it('should measure and judge newly added items', async () => {
		fixture.component.containerWidth = itemWidth + 10
		await settle(fixture.component)
		expect(fixture.component.overflowedItems.length).toBe(4)

		fixture.component.itemCount = 6
		await settle(fixture.component)

		expect(fixture.component.overflowedItems.length).toBe(5)
		expect(fixture.component.overflowedItems).toContain(fixture.component.items[5]!)
	})
})