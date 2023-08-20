import { Component, css, html, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { Popover, PopoverPlacement, PopoverAlignment } from './index.js'

class TestPopoverAbsolute extends Component {
	static override get styles() {
		return css`
			:host {
				display: inline-block;
				margin: 0px;
				width: 100px;
				height: 100px;
			}

			mo-popover {
				width: 50px;
				height: 50px;
			}
		`
	}

	@query('mo-popover') readonly popover!: Popover

	protected override get template() {
		return html`<mo-popover .anchor=${this}>Test</mo-popover>`
	}
}

customElements.define('test-popover-absolute', TestPopoverAbsolute)

class TestPopoverFixed extends Component {
	@query('mo-popover') readonly popover!: Popover

	protected override get template() {
		return html`<mo-popover fixed .anchor=${this}>Test</mo-popover>`
	}
}

customElements.define('test-popover-fixed', TestPopoverFixed)

describe('Popover', () => {
	const fixture = new ComponentTestFixture(() => new TestPopoverAbsolute)

	beforeAll(() => document.body.style.margin = '0')

	it('should set open and dispatch openChange event when setOpen is called', () => {
		const openChangeSpy = jasmine.createSpy()
		fixture.component.popover.addEventListener<any>('openChange', (e: CustomEvent<boolean>) => openChangeSpy(e.detail))

		fixture.component.popover.setOpen(true)

		expect(fixture.component.popover.open).toBe(true)
		expect(openChangeSpy).toHaveBeenCalledWith(true)
	})

	it('should open on popover hover when openOnHover is true', async () => {
		fixture.component.popover.openOnHover = true

		fixture.component.popover.dispatchEvent(new PointerEvent('pointerenter'))
		await fixture.updateComplete

		expect(fixture.component.popover.open).toBe(true)
	})

	it('should open on anchor hover when openOnHover is true', async () => {
		fixture.component.popover.openOnHover = true

		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await fixture.updateComplete

		expect(fixture.component.popover.open).toBe(true)
	})

	it('should open on anchor focus when openOnFocus is true', async () => {
		fixture.component.popover.openOnFocus = true

		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		await fixture.updateComplete

		expect(fixture.component.popover.open).toBe(true)
	})

	const placementExpectations = {
		blockStart: (popover: DOMRect, anchor: DOMRect) => expect(popover.top + popover.height).toBe(anchor.top),
		blockEnd: (popover: DOMRect, anchor: DOMRect) => expect(popover.top).toBe(anchor.top + anchor.height),
		inlineStart: (popover: DOMRect, anchor: DOMRect) => expect(popover.left + popover.width).toBe(anchor.left),
		inlineEnd: (popover: DOMRect, anchor: DOMRect) => expect(popover.left).toBe(anchor.left + anchor.width),
	}

	const alignmentExpectations = {
		blockStart: (popover: DOMRect, anchor: DOMRect) => expect(popover.left).toBe(anchor.left),
		inlineStart: (popover: DOMRect, anchor: DOMRect) => expect(popover.top).toBe(anchor.top),
		blockCenter: (popover: DOMRect, anchor: DOMRect) => expect(popover.left + popover.width / 2).toBeCloseTo(anchor.left + anchor.width / 2, 0),
		inlineCenter: (popover: DOMRect, anchor: DOMRect) => expect(popover.top + popover.height / 2).toBeCloseTo(anchor.top + anchor.height / 2, 0),
		blockEnd: (popover: DOMRect, anchor: DOMRect) => expect(popover.right).toBe(anchor.right),
		inlineEnd: (popover: DOMRect, anchor: DOMRect) => expect(popover.bottom).toBe(anchor.bottom),
	}

	const positioningCases = [
		[PopoverPlacement.BlockStart, PopoverAlignment.Start, '0 0 calc(100vh - 110px) 0', placementExpectations.blockStart, alignmentExpectations.blockStart],
		[PopoverPlacement.BlockStart, PopoverAlignment.Center, '0 0 calc(100vh - 110px) 0', placementExpectations.blockStart, alignmentExpectations.blockCenter],
		[PopoverPlacement.BlockStart, PopoverAlignment.End, '0 0 calc(100vh - 110px) 0', placementExpectations.blockStart, alignmentExpectations.blockEnd],
		[PopoverPlacement.BlockEnd, PopoverAlignment.Start, 'calc(100vh - 110px) 0 0 0', placementExpectations.blockEnd, alignmentExpectations.blockStart],
		[PopoverPlacement.BlockEnd, PopoverAlignment.Center, 'calc(100vh - 110px) 0 0 0', placementExpectations.blockEnd, alignmentExpectations.blockCenter],
		[PopoverPlacement.BlockEnd, PopoverAlignment.End, 'calc(100vh - 110px) 0 0 0', placementExpectations.blockEnd, alignmentExpectations.blockEnd],
		[PopoverPlacement.InlineStart, PopoverAlignment.Start, '0 calc(100vw - 110px) 0 0', placementExpectations.inlineStart, alignmentExpectations.inlineStart],
		[PopoverPlacement.InlineStart, PopoverAlignment.Center, '0 calc(100vw - 110px) 0 0', placementExpectations.inlineStart, alignmentExpectations.inlineCenter],
		[PopoverPlacement.InlineStart, PopoverAlignment.End, '0 calc(100vw - 110px) 0 0', placementExpectations.inlineStart, alignmentExpectations.inlineEnd],
		[PopoverPlacement.InlineEnd, PopoverAlignment.Start, '0 0 0 calc(100vw - 110px)', placementExpectations.inlineEnd, alignmentExpectations.inlineStart],
		[PopoverPlacement.InlineEnd, PopoverAlignment.Center, '0 0 0 calc(100vw - 110px)', placementExpectations.inlineEnd, alignmentExpectations.inlineCenter],
		[PopoverPlacement.InlineEnd, PopoverAlignment.End, '0 0 0 calc(100vw - 110px)', placementExpectations.inlineEnd, alignmentExpectations.inlineEnd],
	] as const

	describe('with absolute positing', () => {
		const fixture = new ComponentTestFixture(() => new TestPopoverAbsolute)

		it('should have absolute positioning', async () => {
			await fixture.updateComplete

			expect(getComputedStyle(fixture.component.popover).position).toBe('absolute')
		})

		for (const [placement, alignment, oobcMargin, expectPlacement, expectAlignment] of positioningCases) {
			it(`should align and place itself visually relative to the anchor element when placement is ${placement} and alignment is ${alignment}`, async () => {
				fixture.component.popover.placement = placement
				fixture.component.popover.alignment = alignment
				fixture.component.popover.open = true

				await fixture.updateComplete

				const anchorRect = fixture.component.getBoundingClientRect()
				const popoverRect = fixture.component.popover.getBoundingClientRect()

				expectPlacement(popoverRect, anchorRect)
				expectAlignment(popoverRect, anchorRect)
			})

			it(`should recorrect its position should it go out of bounds when placement is ${placement} and alignment is ${alignment}`, async () => {
				fixture.component.style.margin = oobcMargin
				fixture.component.popover.placement = placement
				fixture.component.popover.alignment = alignment
				fixture.component.popover.open = true

				fixture.component.requestUpdate()
				await fixture.updateComplete

				const popoverRect = fixture.component.popover.getBoundingClientRect()
				expect(popoverRect.x + popoverRect.width).toBeLessThanOrEqual(window.innerWidth)
				expect(popoverRect.x).toBeGreaterThanOrEqual(0)
				expect(popoverRect.y + popoverRect.height).toBeLessThanOrEqual(window.innerHeight)
				expect(popoverRect.y).toBeGreaterThanOrEqual(0)
			})
		}
	})

	describe('with fixed positioning', () => {
		const fixture = new ComponentTestFixture(() => new TestPopoverFixed)

		it('should have fixed positioning', async () => {
			await fixture.updateComplete

			expect(getComputedStyle(fixture.component.popover).position).toBe('fixed')
		})

		for (const [placement, alignment, oobcMargin, expectPlacement, expectAlignment] of positioningCases) {
			it(`should align and place itself visually relative to the anchor element when placement is ${placement} and alignment is ${alignment}`, async () => {
				fixture.component.popover.placement = placement
				fixture.component.popover.alignment = alignment
				fixture.component.popover.open = true

				await fixture.updateComplete

				const anchorRect = fixture.component.getBoundingClientRect()
				const popoverRect = fixture.component.popover.getBoundingClientRect()

				expectPlacement(popoverRect, anchorRect)
				expectAlignment(popoverRect, anchorRect)
			})

			it(`should re-correct its position should it go out of bounds when placement is ${placement} and alignment is ${alignment}`, async () => {
				fixture.component.style.margin = oobcMargin
				fixture.component.popover.placement = placement
				fixture.component.popover.alignment = alignment
				fixture.component.popover.open = true

				fixture.component.requestUpdate()
				await fixture.updateComplete

				const popoverRect = fixture.component.popover.getBoundingClientRect()
				expect(popoverRect.x + popoverRect.width).toBeLessThanOrEqual(window.innerWidth)
				expect(popoverRect.x).toBeGreaterThanOrEqual(0)
				expect(popoverRect.y + popoverRect.height).toBeLessThanOrEqual(window.innerHeight)
				expect(popoverRect.y).toBeGreaterThanOrEqual(0)
			})
		}
	})
})