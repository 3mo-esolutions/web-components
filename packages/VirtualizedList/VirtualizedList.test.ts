import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type VirtualizedList } from './VirtualizedList.js'
import './index.js'

const dataLength = 400
const data = new Array(dataLength).fill(undefined).map((_, index) => index)

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

const pollUntil = async (predicate: () => boolean, timeout = 4000) => {
	const start = Date.now()
	while (!predicate() && Date.now() - start < timeout) {
		await wait(30)
	}
	return predicate()
}

const createFixture = (getItemTemplate: VirtualizedList<number>['getItemTemplate']) =>
	new ComponentTestFixture<VirtualizedList<number>>(html`
		<mo-virtualized-list style='height: 200px' .data=${data} .getItemTemplate=${getItemTemplate}></mo-virtualized-list>
	`)

/** The items are their own indices, so the rendered text doubles as an index assertion. */
const listItemTemplate = (item: number) => html`<mo-list-item>Item ${item}</mo-list-item>`

const virtualizedScrollerOf = (list: VirtualizedList<number>) =>
	list.renderRoot.querySelector('mo-virtualized-scroller')!

/**
 * VirtualizedScroller's stylesheet never gives its own scroller a height, so the scroller grows to
 * the full virtual height instead of clipping it — it never scrolls and the virtualizer's
 * ResizeObserver loops. Bounding it here is what that component's own stylesheet is missing.
 */
const boundInnerScroller = (list: VirtualizedList<number>) => {
	virtualizedScrollerOf(list).renderRoot.querySelector<HTMLElement>('mo-scroller')!.style.height = '100%'
}

describe('VirtualizedList', () => {
	const fixture = createFixture(listItemTemplate)

	beforeEach(() => boundInnerScroller(fixture.component))

	/** The virtualizer keeps laying out for a few frames, so wait until the window stops moving. */
	const settle = async () => {
		await fixture.updateComplete
		await pollUntil(() => fixture.component.items.length > 0)
		let previous = ''
		await pollUntil(() => {
			const current = `${fixture.component.items.length}:${fixture.component.items[0]?.textContent}`
			const stable = current === previous
			previous = current
			return stable
		})
		await wait(150)
	}

	const scrollToEnd = async () => {
		const scroller = virtualizedScrollerOf(fixture.component).renderRoot.querySelector<HTMLElement>('mo-scroller')!
		scroller.scrollTop = scroller.scrollHeight
		await pollUntil(() => (fixture.component.getRenderedItemIndex(fixture.component.items[0]!) ?? 0) > 0)
		await settle()
	}

	it('should be a list for assistive technology', () => {
		expect(fixture.component.role).toBe('list')
		expect(fixture.component.getAttribute('role')).toBe('list')
	})

	it('should render "data" through "getItemTemplate" inside a virtualized scroller', async () => {
		await settle()

		expect(virtualizedScrollerOf(fixture.component)).not.toBeNull()
		expect(fixture.component.items[0]!.tagName).toBe('MO-LIST-ITEM')
		expect(fixture.component.items[0]!.textContent).toContain('Item 0')
	})

	describe('items', () => {
		const mixedFixture = createFixture(item => item % 2 === 0
			? html`<mo-list-item>Item ${item}</mo-list-item>`
			: html`<div class='separator' style='height: 48px'>—</div>`)

		beforeEach(() => boundInnerScroller(mixedFixture.component))

		it('should include only rendered elements which are list items', async () => {
			await pollUntil(() => mixedFixture.component.items.length > 0)
			await wait(150)
			const rendered = virtualizedScrollerOf(mixedFixture.component).renderedItems

			expect(rendered.some(element => element.tagName === 'DIV')).toBeTrue()
			expect(mixedFixture.component.items.every(item => item.tagName === 'MO-LIST-ITEM')).toBeTrue()
			expect(mixedFixture.component.items.length).toBeLessThan(rendered.length)
		})

		it('should reflect the rendered window after scrolling, not the full data', async () => {
			await settle()
			expect(fixture.component.getRenderedItemIndex(fixture.component.items[0]!)).toBe(0)

			await scrollToEnd()

			expect(fixture.component.items.length).toBeLessThan(dataLength / 2)
			expect(fixture.component.getRenderedItemIndex(fixture.component.items[0]!)).toBeGreaterThan(0)
		})
	})

	describe('itemsLength', () => {
		it('should count all data rather than the rendered window', async () => {
			await settle()

			expect(fixture.component.itemsLength).toBe(dataLength)
			expect(fixture.component.items.length).toBeLessThan(dataLength)
		})
	})

	describe('getItem', () => {
		it('should return the rendered element for an index in view', async () => {
			await settle()

			const item = fixture.component.getItem(1)

			expect(item instanceof Element).toBeTrue()
			expect((item as Element).textContent).toContain('Item 1')
		})

		it('should return a handle for an index out of view', async () => {
			await settle()

			const item = fixture.component.getItem(dataLength - 1)

			expect(item instanceof Element).toBeFalse()
			expect(typeof item?.scrollIntoView).toBe('function')
		})
	})

	describe('getRenderedItemIndex', () => {
		it('should translate a rendered item to its index among all data', async () => {
			await settle()
			await scrollToEnd()

			const item = fixture.component.items[1]!
			const index = fixture.component.getRenderedItemIndex(item)

			expect(index).toBeGreaterThan(0)
			expect(item.textContent).toContain(`Item ${index}`)
		})
	})

	describe('keyboard navigation', () => {
		const arrowDown = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))

		it('should move focus through the rendered items with the arrow keys', async () => {
			await settle()
			const focus = fixture.component.focusController

			try {
				focus.focusIn()

				arrowDown()
				expect(focus.focusedItemIndex).toBe(0)
				expect(fixture.component.items[0]!.hasAttribute('focused')).toBeTrue()

				arrowDown()
				expect(focus.focusedItemIndex).toBe(1)
				expect(fixture.component.items[1]!.hasAttribute('focused')).toBeTrue()
				expect(fixture.component.items[0]!.hasAttribute('focused')).toBeFalse()
			} finally {
				focus.focusOut()
			}
		})
	})
})