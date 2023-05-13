import { Component, css, html, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { Popover } from './Popover.js'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverAlignment } from './PopoverAlignment.js'

class PopoverAbsoluteTest extends Component {
	static override get styles() {
		return css`
			:host {
				display: inline-block;
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

	beforeAll(() => {
		document.body.style.margin = '0'
	})

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

	describe('with absolute positing', () => {
		const fixture = new ComponentTestFixture(() => new PopoverAbsoluteTest)

		it('should have absolute positioning', async () => {
			await fixture.updateComplete

			expect(getComputedStyle(fixture.component.popover).position).toBe('absolute')
		})

		// TODO: Test Transform
		for (const [placement, alignment, assertion] of [
			[PopoverPlacement.BlockStart, PopoverAlignment.Start, (popover: DOMRect, anchor: DOMRect) => popover.top + popover.height === anchor.top],
			[PopoverPlacement.BlockStart, PopoverAlignment.Center, (popover: DOMRect, anchor: DOMRect) => popover.top + popover.height === anchor.top],
			[PopoverPlacement.BlockStart, PopoverAlignment.End, (popover: DOMRect, anchor: DOMRect) => popover.top + popover.height === anchor.top],
			[PopoverPlacement.BlockEnd, PopoverAlignment.Start, (popover: DOMRect, anchor: DOMRect) => popover.top === anchor.top + anchor.height],
			[PopoverPlacement.BlockEnd, PopoverAlignment.Center, (popover: DOMRect, anchor: DOMRect) => popover.top === anchor.top + anchor.height],
			[PopoverPlacement.BlockEnd, PopoverAlignment.End, (popover: DOMRect, anchor: DOMRect) => popover.top === anchor.top + anchor.height],
			[PopoverPlacement.InlineStart, PopoverAlignment.Start, (popover: DOMRect, anchor: DOMRect) => popover.left + popover.width === anchor.left],
			[PopoverPlacement.InlineStart, PopoverAlignment.Center, (popover: DOMRect, anchor: DOMRect) => popover.left + popover.width === anchor.left],
			[PopoverPlacement.InlineStart, PopoverAlignment.End, (popover: DOMRect, anchor: DOMRect) => popover.left + popover.width === anchor.left],
			[PopoverPlacement.InlineEnd, PopoverAlignment.Start, (popover: DOMRect, anchor: DOMRect) => popover.left === anchor.left + anchor.width],
			[PopoverPlacement.InlineEnd, PopoverAlignment.Center, (popover: DOMRect, anchor: DOMRect) => popover.left === anchor.left + anchor.width],
			[PopoverPlacement.InlineEnd, PopoverAlignment.End, (popover: DOMRect, anchor: DOMRect) => popover.left === anchor.left + anchor.width],
		] as const) {
			it(`should align and place itself logically relative to the anchor element when placement is ${placement} and alignment is ${alignment}`, async () => {
				fixture.component.popover.placement = placement
				fixture.component.popover.alignment = alignment

				await fixture.updateComplete

				const anchorRect = fixture.component.getBoundingClientRect()
				const popoverRect = fixture.component.popover.getBoundingClientRect()

				expect(assertion(popoverRect, anchorRect)).toBe(true)
			})
		}
	})

	describe('with fixed positioning', () => {
		const fixture = new ComponentTestFixture(() => new PopoverFixedTest)

		it('should have fixed positioning', async () => {
			await fixture.updateComplete

			expect(getComputedStyle(fixture.component.popover).position).toBe('fixed')
		})
	})
})