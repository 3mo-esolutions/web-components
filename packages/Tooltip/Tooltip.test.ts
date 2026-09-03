import { Component, component, css, html, ifDefined, state, type HTMLTemplateResult } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { TooltipPlacement } from './TooltipPlacement.js'
import './index.js'

/** The host is the tooltip's anchor, so the aria-label contract and the focus interest are
 * observable on it — as they are on whatever element a `tooltip()` decorates. */
@component('test-tooltip-anchor')
class TestTooltipAnchor extends Component {
	override tabIndex = 0

	@state() content: string | HTMLTemplateResult | typeof html.nothing = 'Tooltip content'
	@state() tooltipPlacement?: TooltipPlacement

	get tooltip() { return this.renderRoot.querySelector('mo-tooltip')! }
	get tooltipPopover() { return this.tooltip.renderRoot.querySelector('mo-popover')! }

	static override get styles() {
		// Sized and pushed away from the viewport edges, so a placement has somewhere to settle.
		return css`
			:host {
				display: inline-block;
				width: 80px;
				height: 24px;
				margin-block-start: 120px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-tooltip .anchor=${this} placement=${ifDefined(this.tooltipPlacement)}>${this.content}</mo-tooltip>
		`
	}
}

describe('Tooltip', () => {
	// The pointer type is a static shared by every PointerController on the page and other suites
	// drive it to "touch", which would send the tooltip down its touch path.
	beforeEach(() => document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' })))

	const fixture = new ComponentTestFixture(() => new TestTooltipAnchor)

	/** The controllers subscribe asynchronously and the slot change lands in its own task. */
	const settle = () => new Promise(resolve => setTimeout(resolve, 30))

	beforeEach(settle)

	afterEach(async () => {
		fixture.component?.tooltip?.['setOpen'](false)
		fixture.component?.blur()
		fixture.component?.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }))
		await fixture.component?.updateComplete
	})

	async function setContent(content: TestTooltipAnchor['content']) {
		fixture.component.content = content
		await fixture.updateComplete
		await settle()
	}

	describe('rich mode', () => {
		it('should stay non-rich for text-only content', () => {
			expect(fixture.component.tooltip.rich).toBeFalse()
			expect(fixture.component.tooltip.hasAttribute('rich')).toBeFalse()
		})

		it('should become rich and reflect the attribute when element content is slotted', async () => {
			await setContent(html`<span>Rich content</span>`)

			expect(fixture.component.tooltip.rich).toBeTrue()
			expect(fixture.component.tooltip.hasAttribute('rich')).toBeTrue()
		})
	})

	describe('accessibility', () => {
		it('should set the anchor\'s aria-label from the tooltip\'s text content', () => {
			expect(fixture.component.getAttribute('aria-label')).toBe('Tooltip content')
		})

		it('should not set an aria-label on the anchor for rich content', async () => {
			await setContent(html`<span>Rich content</span>`)

			expect(fixture.component.hasAttribute('aria-label')).toBeFalse()
		})

		it('should remove the anchor\'s aria-label when the content is cleared', async () => {
			expect(fixture.component.getAttribute('aria-label')).toBe('Tooltip content')

			await setContent(html.nothing)

			expect(fixture.component.hasAttribute('aria-label')).toBeFalse()
		})
	})

	describe('interest-based opening', () => {
		function spyOnOpenChange() {
			const spy = jasmine.createSpy('openChange')
			fixture.component.tooltip.addEventListener<any>('openChange', (e: CustomEvent<boolean>) => spy(e.detail))
			return spy
		}

		/** Headless Firefox delivers no focus events at all for a programmatic `focus()` — the
		 * element does become `document.activeElement`, but neither `focus` nor `focusin` arrives —
		 * so the events a real focus would raise have to be dispatched alongside it. Both are
		 * idempotent for the controller, so the real ones Chrome does fire change nothing. */
		function focusAnchor() {
			fixture.component.focus({ preventScroll: true })
			fixture.component.dispatchEvent(new FocusEvent('focus', { composed: true }))
			fixture.component.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
		}

		function blurAnchor() {
			fixture.component.blur()
			fixture.component.dispatchEvent(new FocusEvent('blur', { composed: true }))
			fixture.component.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }))
		}

		function focusByKeyboard() {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
			focusAnchor()
		}

		it('should open and dispatch openChange when the anchor receives keyboard focus', () => {
			const spy = spyOnOpenChange()

			focusByKeyboard()

			expect(fixture.component.tooltip.open).toBeTrue()
			expect(spy).toHaveBeenCalledOnceWith(true)
		})

		it('should not open when the anchor is focused programmatically', () => {
			const spy = spyOnOpenChange()

			focusAnchor()

			expect(fixture.component.tooltip.open).toBeFalse()
			expect(spy).not.toHaveBeenCalled()
		})

		it('should close when keyboard focus leaves the anchor', () => {
			focusByKeyboard()
			expect(fixture.component.tooltip.open).toBeTrue()
			const spy = spyOnOpenChange()

			blurAnchor()

			expect(fixture.component.tooltip.open).toBeFalse()
			expect(spy).toHaveBeenCalledOnceWith(false)
		})
	})

	describe('placement', () => {
		it('should forward placement to the underlying popover so the tooltip settles on the requested side of the anchor', async () => {
			fixture.component.tooltipPlacement = TooltipPlacement.InlineEnd
			await fixture.updateComplete
			await fixture.component.tooltip.updateComplete

			expect(fixture.component.tooltipPopover.placement).toBe(TooltipPlacement.InlineEnd)

			const opened = new Promise<void>(resolve => fixture.component.tooltipPopover.addEventListener('toggle', () => resolve(), { once: true }))
			fixture.component.tooltip['setOpen'](true)
			await fixture.component.tooltip.updateComplete
			await opened
			await settle()

			const anchorRect = fixture.component.getBoundingClientRect()
			const popoverRect = fixture.component.tooltipPopover.getBoundingClientRect()
			expect(popoverRect.left).toBeGreaterThanOrEqual(anchorRect.right - 1)
		})
	})
})