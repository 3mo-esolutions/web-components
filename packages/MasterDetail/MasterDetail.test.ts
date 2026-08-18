import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SplitterItem } from '@3mo/splitter'
import { type MasterDetail } from './MasterDetail.js'
import './index.js'

describe('MasterDetail', () => {
	const fixture = new ComponentTestFixture<MasterDetail>(html`
		<mo-master-detail>
			<div slot='master'>Master</div>
		</mo-master-detail>
	`)

	// "slotchange" is signalled at the end of the current task, so it outlives "updateComplete".
	// The resizer fades rather than blinks, so its transition has to settle before it can be measured.
	const updateComplete = async () => {
		await new Promise(resolve => setTimeout(resolve))
		await fixture.updateComplete
		await splitter().updateComplete
		await Promise.all(resizer().getAnimations().map(animation => animation.finished.catch(() => undefined)))
	}

	const splitter = () => fixture.component.renderRoot.querySelector('mo-splitter')!
	const items = () => [...fixture.component.renderRoot.querySelectorAll('mo-splitter-item')] as [SplitterItem, SplitterItem]
	const resizer = () => splitter().renderRoot.querySelector('mo-splitter-resizer-host')!
	const resizerStyle = () => {
		const { display, opacity, pointerEvents } = getComputedStyle(resizer())
		return { display, opacity, pointerEvents, size: resizer().getBoundingClientRect().height }
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
			const sizeWhileSplit = resizerStyle().size

			fixture.component.collapsed = true
			await updateComplete()

			expect(resizerStyle().opacity).toBe('0')
			expect(resizerStyle().pointerEvents).toBe('none')
			expect(resizerStyle().size).toBe(sizeWhileSplit)
		})
	})
})