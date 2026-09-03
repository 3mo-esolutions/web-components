import { Component, component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SplitterItem } from '@3mo/splitter'
import { type MasterDetail } from './MasterDetail.js'
import './index.js'

@component('master-detail-test-consumer')
class DetailForwardingConsumer extends Component {
	get masterDetail() { return this.renderRoot.querySelector('mo-master-detail')! }

	protected override get template() {
		return html`
			<mo-master-detail>
				<div slot='master'>Master</div>
				<slot name='detail' slot='detail'></slot>
			</mo-master-detail>
		`
	}
}

describe('MasterDetail', () => {
	const fixture = new ComponentTestFixture<MasterDetail>(html`
		<mo-master-detail>
			<div slot='master'>Master</div>
		</mo-master-detail>
	`)

	const updateComplete = async () => {
		await fixture.updateComplete
		await splitter().updateComplete
	}

	const splitter = () => fixture.component.renderRoot.querySelector('mo-splitter')!
	const items = () => [...fixture.component.renderRoot.querySelectorAll('mo-splitter-item')] as [SplitterItem, SplitterItem]
	const resizer = () => splitter().renderRoot.querySelector('mo-splitter-resizer-host')
	const resizerStyle = () => {
		const res = resizer()
		if (!res) {
			return { display: 'none', opacity: '0', pointerEvents: 'none', size: 0 }
		}
		const { display, opacity, pointerEvents } = getComputedStyle(res)
		return { display, opacity, pointerEvents, size: res.getBoundingClientRect().height }
	}

	const slotDetail = async () => {
		const detail = document.createElement('div')
		detail.slot = 'detail'
		fixture.component.appendChild(detail)
		await updateComplete()
		return detail
	}

	describe('without detail content', () => {
		it('should not be open', () => {
			expect(fixture.component.open).toBe(false)
		})

		it('should collapse the detail pane', () => {
			expect(items()[1].collapsed).toBe(true)
		})

		it('should leave the whole space to the master pane', () => {
			expect(items()[0].size).toBe(undefined)
		})

		it('should not offer a resizer, nor reserve space for one', () => {
			expect(resizerStyle().display).toBe('none')
			expect(resizerStyle().size).toBe(0)
		})
	})

	describe('with detail content', () => {
		it('should open and dispatch "openChange" once', async () => {
			const handler = jasmine.createSpy()
			fixture.component.addEventListener('openChange', handler)

			await slotDetail()

			expect(fixture.component.open).toBe(true)
			expect(handler).toHaveBeenCalledTimes(1)
			expect(handler.calls.mostRecent().args[0].detail).toBe(true)
		})

		it('should not dispatch "openChange" again when the detail content changes while it stays open', async () => {
			await slotDetail()
			const handler = jasmine.createSpy()
			fixture.component.addEventListener('openChange', handler)

			await slotDetail()

			expect(fixture.component.open).toBe(true)
			expect(handler).not.toHaveBeenCalled()
		})

		it('should not count a forwarded slot without content as detail content', async () => {
			const consumer = new DetailForwardingConsumer()
			document.body.appendChild(consumer)
			try {
				await consumer.updateComplete
				await new Promise(resolve => setTimeout(resolve, 10))

				expect(consumer.masterDetail.open).toBe(false)

				const detail = document.createElement('div')
				detail.slot = 'detail'
				consumer.appendChild(detail)
				await new Promise(resolve => setTimeout(resolve, 10))

				expect(consumer.masterDetail.open).toBe(true)
			} finally {
				consumer.remove()
			}
		})

		it('should split the space between both panes', async () => {
			await slotDetail()

			expect(items()[0].size).toBe(fixture.component.masterSize)
			expect(items()[0].min).toBe(fixture.component.minSize)
			expect(items()[1].collapsed).toBe(false)
			expect(items()[1].min).toBe(fixture.component.minSize)
		})

		it('should offer a resizer', async () => {
			await slotDetail()

			expect(resizerStyle().display).not.toBe('none')
			expect(resizerStyle().opacity).toBe('1')
			expect(resizerStyle().pointerEvents).not.toBe('none')
			expect(resizerStyle().size).toBeGreaterThan(0)
		})

		it('should close again when the content is removed', async () => {
			const detail = await slotDetail()
			const handler = jasmine.createSpy()
			fixture.component.addEventListener('openChange', handler)

			detail.remove()
			await updateComplete()

			expect(fixture.component.open).toBe(false)
			expect(items()[1].collapsed).toBe(true)
			expect(handler.calls.mostRecent().args[0].detail).toBe(false)
		})
	})

	describe('Property "direction"', () => {
		const horizontalFixture = new ComponentTestFixture<MasterDetail>(html`
			<mo-master-detail direction='horizontal' minSize='50px' style='width: 400px; height: 200px'>
				<div slot='master'>Master</div>
				<div slot='detail'>Detail</div>
			</mo-master-detail>
		`)

		const settleHorizontal = async () => {
			await horizontalFixture.updateComplete
			await new Promise(resolve => setTimeout(resolve, 50))
			await horizontalFixture.updateComplete
		}

		const pane = (slot: string) => horizontalFixture.component.querySelector<HTMLElement>(`[slot=${slot}]`)!.getBoundingClientRect()

		it('should lay the panes out horizontally when set to "horizontal"', async () => {
			await settleHorizontal()

			expect(horizontalFixture.component.open).toBe(true)
			expect(pane('master').right).toBeLessThanOrEqual(pane('detail').left + 1)
			expect(pane('master').top).toBe(pane('detail').top)
		})

		it('should forward the direction to the splitter\'s resizer', async () => {
			await settleHorizontal()

			const resizerHost = horizontalFixture.component.renderRoot
				.querySelector('mo-splitter')!.renderRoot
				.querySelector('mo-splitter-resizer-host')!

			expect(resizerHost.getAttribute('direction')).toBe('horizontal')
			expect(getComputedStyle(resizerHost).cursor).toBe('col-resize')
		})
	})

	describe('revealing the last interaction', () => {
		const scrollableFixture = new ComponentTestFixture<MasterDetail>(html`
			<mo-master-detail minSize='100px' style='height: 400px'>
				<div slot='master' style='height: 100%; overflow: auto'>
					${new Array(10).fill(undefined).map((_, index) => html`<div id='item-${index}' style='height: 40px'>Item ${index}</div>`)}
				</div>
			</mo-master-detail>
		`)

		it('should keep the last pointed-at master element in view when the detail pane opens', async () => {
			const item = scrollableFixture.component.querySelector('#item-9')!
			item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))

			const detail = document.createElement('div')
			detail.slot = 'detail'
			scrollableFixture.component.appendChild(detail)
			await new Promise(resolve => setTimeout(resolve, 10))

			const scroller = scrollableFixture.component.querySelector<HTMLElement>('[slot=master]')!
			expect(scroller.getBoundingClientRect().height).toBeLessThan(400)
			expect(item.getBoundingClientRect().bottom).toBeLessThanOrEqual(scroller.getBoundingClientRect().bottom + 1)
			expect(item.getBoundingClientRect().top).toBeGreaterThanOrEqual(scroller.getBoundingClientRect().top - 1)
		})

		it('should keep the last focused master element in view when the detail pane opens', async () => {
			const item = scrollableFixture.component.querySelector<HTMLElement>('#item-9')!
			item.tabIndex = 0
			// Workaround: headless Firefox focusin
			item.focus({ preventScroll: true })
			item.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))

			const detail = document.createElement('div')
			detail.slot = 'detail'
			scrollableFixture.component.appendChild(detail)
			await new Promise(resolve => setTimeout(resolve, 10))

			const scroller = scrollableFixture.component.querySelector<HTMLElement>('[slot=master]')!
			expect(scroller.getBoundingClientRect().height).toBeLessThan(400)
			expect(item.getBoundingClientRect().bottom).toBeLessThanOrEqual(scroller.getBoundingClientRect().bottom + 1)
			expect(item.getBoundingClientRect().top).toBeGreaterThanOrEqual(scroller.getBoundingClientRect().top - 1)
		})

		it('should not scroll when nothing was interacted with', async () => {
			const scroller = scrollableFixture.component.querySelector<HTMLElement>('[slot=master]')!

			const detail = document.createElement('div')
			detail.slot = 'detail'
			scrollableFixture.component.appendChild(detail)
			await new Promise(resolve => setTimeout(resolve, 10))

			expect(scroller.scrollTop).toBe(0)
		})
	})

	describe('collapsed', () => {
		it('should shrink the detail pane to its own content while keeping it slotted', async () => {
			const detail = await slotDetail()

			fixture.component.collapsed = true
			await updateComplete()

			expect(fixture.component.open).toBe(true)
			expect(detail.assignedSlot?.name).toBe('detail')
			expect(items()[1].collapsed).toBe(true)
			expect(items()[0].size).toBe(undefined)
		})

		it('should disable the resizer without letting the panes collapse against each other', async () => {
			await slotDetail()
			fixture.component.collapsed = true
			await updateComplete()

			expect(fixture.component.collapsed).toBeTrue()
			expect(items()[1].collapsed).toBeTrue()
			expect(resizer()).not.toBeNull()
		})
	})
})