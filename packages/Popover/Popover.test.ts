import { Component, css, html, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { Popover, PopoverPlacement, PopoverAlignment } from './index.js'

class PopoverAbsoluteTest extends Component {
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

customElements.define('mo-popover-absolute-test', PopoverAbsoluteTest)

class PopoverFixedTest extends Component {
	@query('mo-popover') readonly popover!: Popover

	protected override get template() {
		return html`<mo-popover fixed .anchor=${this}>Test</mo-popover>`
	}
}

customElements.define('mo-popover-fixed-test', PopoverFixedTest)

describe('Popover', () => {
	const fixture = new ComponentTestFixture(() => new PopoverAbsoluteTest)

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
		blockCenter: (popover: DOMRect, anchor: DOMRect) => expect(popover.left + popover.width / 2).toBeCloseTo(anchor.left + anchor.width / 2),
		inlineCenter: (popover: DOMRect, anchor: DOMRect) => expect(popover.top + popover.height / 2).toBeCloseTo(anchor.top + anchor.height / 2),
		blockEnd: (popover: DOMRect, anchor: DOMRect) => expect(popover.left + popover.width).toBe(anchor.left + anchor.width),
		inlineEnd: (popover: DOMRect, anchor: DOMRect) => expect(popover.top + popover.height).toBe(anchor.top + anchor.height),
	}

	const positioningCases = [
		[PopoverPlacement.BlockStart, PopoverAlignment.Start, placementExpectations.blockStart, alignmentExpectations.blockStart],
		[PopoverPlacement.BlockStart, PopoverAlignment.Center, placementExpectations.blockStart, alignmentExpectations.blockCenter],
		[PopoverPlacement.BlockStart, PopoverAlignment.End, placementExpectations.blockStart, alignmentExpectations.blockEnd],
		[PopoverPlacement.BlockEnd, PopoverAlignment.Start, placementExpectations.blockEnd, alignmentExpectations.blockStart],
		[PopoverPlacement.BlockEnd, PopoverAlignment.Center, placementExpectations.blockEnd, alignmentExpectations.blockCenter],
		[PopoverPlacement.BlockEnd, PopoverAlignment.End, placementExpectations.blockEnd, alignmentExpectations.blockEnd],
		[PopoverPlacement.InlineStart, PopoverAlignment.Start, placementExpectations.inlineStart, alignmentExpectations.inlineStart],
		[PopoverPlacement.InlineStart, PopoverAlignment.Center, placementExpectations.inlineStart, alignmentExpectations.inlineCenter],
		[PopoverPlacement.InlineStart, PopoverAlignment.End, placementExpectations.inlineStart, alignmentExpectations.inlineEnd],
		[PopoverPlacement.InlineEnd, PopoverAlignment.Start, placementExpectations.inlineEnd, alignmentExpectations.inlineStart],
		[PopoverPlacement.InlineEnd, PopoverAlignment.Center, placementExpectations.inlineEnd, alignmentExpectations.inlineCenter],
		[PopoverPlacement.InlineEnd, PopoverAlignment.End, placementExpectations.inlineEnd, alignmentExpectations.inlineEnd],
	] as const

	describe('with absolute positing', () => {
		const fixture = new ComponentTestFixture(() => new PopoverAbsoluteTest)

		it('should have absolute positioning', async () => {
			await fixture.updateComplete

			expect(getComputedStyle(fixture.component.popover).position).toBe('absolute')
		})

		for (const [placement, alignment, expectPlacement, expectAlignment] of positioningCases) {
			it(`should align and place itself visually relative to the anchor element when placement is ${placement} and alignment is ${alignment}`, async () => {
				fixture.component.popover.placement = placement
				fixture.component.popover.alignment = alignment

				await fixture.updateComplete

				const anchorRect = fixture.component.getBoundingClientRect()
				const popoverRect = fixture.component.popover.getBoundingClientRect()

				expectPlacement(popoverRect, anchorRect)
				expectAlignment(popoverRect, anchorRect)
			})
		}
	})

	describe('with fixed positioning', () => {
		const fixture = new ComponentTestFixture(() => new PopoverFixedTest)

		it('should have fixed positioning', async () => {
			await fixture.updateComplete

			expect(getComputedStyle(fixture.component.popover).position).toBe('fixed')
		})

		for (const [placement, alignment, expectPlacement, expectAlignment] of positioningCases) {
			it(`should align and place itself visually relative to the anchor element when placement is ${placement} and alignment is ${alignment}`, async () => {
				fixture.component.popover.placement = placement
				fixture.component.popover.alignment = alignment

				await fixture.updateComplete

				const anchorRect = fixture.component.getBoundingClientRect()
				const popoverRect = fixture.component.popover.getBoundingClientRect()

				expectPlacement(popoverRect, anchorRect)
				expectAlignment(popoverRect, anchorRect)
			})
		}
	})
})