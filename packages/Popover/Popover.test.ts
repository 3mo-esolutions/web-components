import { Component, component, css, html, property, query, queryAll } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Popover, PopoverPlacement, PopoverAlignment } from './index.js'

describe('Popover', () => {
	@component('test-generic-popover')
	class GenericPopover extends Component {
		@query('mo-popover') readonly popoverElement!: Popover

		protected override get template() {
			return html`<mo-popover .anchor=${this}>Test</mo-popover>`
		}
	}

	describe('open focus and state management', () => {
		@component('test-focus-popover')
		class FocusPopover extends Component {
			@query('mo-popover') readonly popoverElement!: Popover
			@queryAll('input') readonly inputs!: Array<HTMLInputElement>

			@property({ type: Boolean }) autoFocus = false

			protected override get template() {
				return html`
					<mo-popover .anchor=${this}>
						<input />
						<input ?autoFocus=${this.autoFocus} />
					</mo-popover>
				`
			}
		}

		@component('test-custom-target-popover')
		class CustomTargetPopover extends Component {
			@query('mo-popover') readonly popoverElement!: Popover
			@query('#target') readonly target!: HTMLButtonElement
			@query('#non-target') readonly nonTarget!: HTMLButtonElement

			@property({ type: Boolean }) autoFocus = false

			protected override get template() {
				return html`
					<button id='non-target'>Don't Open</button>
					<button id='target'>Open</button>
					<mo-popover target='target' .anchor=${this}></mo-popover>
				`
			}
		}

		const generic = new ComponentTestFixture(() => new GenericPopover)
		const autoFocus = new ComponentTestFixture(() => new FocusPopover)
		const customTarget = new ComponentTestFixture(() => new CustomTargetPopover)

		it('should set open and dispatch openChange event when setOpen is called', () => {
			const openChangeSpy = jasmine.createSpy()
			generic.component.popoverElement.addEventListener<any>('openChange', (e: CustomEvent<boolean>) => openChangeSpy(e.detail))

			generic.component.popoverElement.setOpen(true)

			expect(generic.component.popoverElement.open).toBe(true)
			expect(openChangeSpy).toHaveBeenCalledWith(true)
		})

		it('should open when the target is given and the target is clicked', async () => {
			customTarget.component.target.click()

			await customTarget.updateComplete

			expect(customTarget.component.popoverElement.open).toBe(true)
		})

		it('should not open when the target is given and the something with the target id is clicked outside the anchor', async () => {
			const div = document.createElement('div')
			div.id = 'target'
			document.body.appendChild(div)
			div.click()

			await customTarget.updateComplete

			expect(customTarget.component.popoverElement.open).toBe(false)
			document.body.removeChild(div)
		})

		it('should not open when the target is given and something else is clicked', async () => {
			customTarget.component.click()
			customTarget.component.nonTarget.click()

			await customTarget.updateComplete

			expect(customTarget.component.popoverElement.open).toBe(false)
		})

		it('should open when the anchor is clicked', async () => {
			generic.component.click()

			await generic.updateComplete

			expect(generic.component.popoverElement.open).toBe(true)
		})

		it('should return focus to the anchor when closed', async () => {
			spyOn(generic.component!, 'focus')
			generic.component.popoverElement.open = true

			await generic.updateComplete

			generic.component.popoverElement.setOpen(false)

			await generic.updateComplete

			expect(generic.component.focus).toHaveBeenCalled()
		})

		it('should focus the first focusable element when opened', async () => {
			spyOn(autoFocus.component.inputs[0]!, 'focus')
			autoFocus.component.popoverElement.setOpen(true)

			await autoFocus.updateComplete
			await new Promise(r => setTimeout(r))

			expect(autoFocus.component.inputs[0]!.focus).toHaveBeenCalledOnceWith()
		})

		it('should focus the first element with "autofocus" when available', async () => {
			spyOn(autoFocus.component.inputs[0]!, 'focus')
			spyOn(autoFocus.component.inputs[1]!, 'focus')

			autoFocus.component.autoFocus = true
			await autoFocus.updateComplete

			autoFocus.component.popoverElement.setOpen(true)
			await autoFocus.updateComplete
			await new Promise(r => setTimeout(r))

			expect(autoFocus.component.inputs[0]!.focus).not.toHaveBeenCalled()
			expect(autoFocus.component.inputs[1]!.focus).toHaveBeenCalledOnceWith()
		})
	})

	describe('light-dismiss', () => {
		const fixture1 = new ComponentTestFixture(() => new GenericPopover)
		const fixture2 = new ComponentTestFixture(() => new GenericPopover)

		it('should close the popover when clicked outside of the popover', async () => {
			fixture1.component.popoverElement.open = true

			await fixture1.updateComplete

			document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(fixture1.component.popoverElement.open).toBe(false)
		})

		it('should not close the popover when clicked inside of the popover', async () => {
			fixture1.component.popoverElement.open = true

			await fixture1.updateComplete

			fixture1.component.popoverElement.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(fixture1.component.popoverElement.open).toBe(true)
		})

		it('should not close when "manual" is true', async () => {
			fixture1.component.popoverElement.manual = true
			fixture1.component.popoverElement.open = true

			await fixture1.updateComplete

			document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(fixture1.component.popoverElement.open).toBe(true)
		})

		it('should close multiple popovers when clicked outside of the popover', async () => {
			fixture1.component.popoverElement.open = true
			fixture2.component.popoverElement.open = true

			await fixture1.updateComplete
			await fixture2.updateComplete

			document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(fixture1.component.popoverElement.open).toBe(false)
			expect(fixture2.component.popoverElement.open).toBe(false)
		})
	})

	describe('accessible keyboard bindings', () => {
		const fixture1 = new ComponentTestFixture(() => new GenericPopover)
		const fixture2 = new ComponentTestFixture(() => new GenericPopover)

		it('should close the popover when "Escape" is pressed', async () => {
			fixture1.component.popoverElement.open = true

			await fixture1.updateComplete

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

			expect(fixture1.component.popoverElement.open).toBe(false)
		})

		it('should not close the popover when "Escape" is pressed and "manual" is true', async () => {
			fixture1.component.popoverElement.manual = true
			fixture1.component.popoverElement.open = true

			await fixture1.updateComplete

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

			expect(fixture1.component.popoverElement.open).toBe(true)
		})

		it('should close only the last connected popover when "Escape" is pressed', async () => {
			fixture1.component.popoverElement.open = true
			fixture2.component.popoverElement.open = true

			await fixture1.updateComplete
			await fixture2.updateComplete

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

			expect(fixture1.component.popoverElement.open).toBe(true)
			expect(fixture2.component.popoverElement.open).toBe(false)
		})
	})

	describe('positioning', () => {
		beforeAll(() => document.body.style.margin = '0')

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
			// [PopoverPlacement.BlockStart, PopoverAlignment.Start, '0 0 calc(100vh - 110px) 0', placementExpectations.blockStart, alignmentExpectations.blockStart],
			// [PopoverPlacement.BlockStart, PopoverAlignment.Center, '0 0 calc(100vh - 110px) 0', placementExpectations.blockStart, alignmentExpectations.blockCenter],
			// [PopoverPlacement.BlockStart, PopoverAlignment.End, '0 0 calc(100vh - 110px) 0', placementExpectations.blockStart, alignmentExpectations.blockEnd],
			[PopoverPlacement.BlockEnd, PopoverAlignment.Start, 'calc(100vh - 110px) 0 0 0', placementExpectations.blockEnd, alignmentExpectations.blockStart],
			[PopoverPlacement.BlockEnd, PopoverAlignment.Center, 'calc(100vh - 110px) 0 0 0', placementExpectations.blockEnd, alignmentExpectations.blockCenter],
			[PopoverPlacement.BlockEnd, PopoverAlignment.End, 'calc(100vh - 110px) 0 0 0', placementExpectations.blockEnd, alignmentExpectations.blockEnd],
			// [PopoverPlacement.InlineStart, PopoverAlignment.Start, '0 calc(100vw - 110px) 0 0', placementExpectations.inlineStart, alignmentExpectations.inlineStart],
			// [PopoverPlacement.InlineStart, PopoverAlignment.Center, '0 calc(100vw - 110px) 0 0', placementExpectations.inlineStart, alignmentExpectations.inlineCenter],
			// [PopoverPlacement.InlineStart, PopoverAlignment.End, '0 calc(100vw - 110px) 0 0', placementExpectations.inlineStart, alignmentExpectations.inlineEnd],
			[PopoverPlacement.InlineEnd, PopoverAlignment.Start, '0 0 0 calc(100vw - 110px)', placementExpectations.inlineEnd, alignmentExpectations.inlineStart],
			[PopoverPlacement.InlineEnd, PopoverAlignment.Center, '0 0 0 calc(100vw - 110px)', placementExpectations.inlineEnd, alignmentExpectations.inlineCenter],
			[PopoverPlacement.InlineEnd, PopoverAlignment.End, '0 0 0 calc(100vw - 110px)', placementExpectations.inlineEnd, alignmentExpectations.inlineEnd],
		] as const

		describe('with absolute positing', () => {
			@component('test-popover-absolute')
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

				@query('mo-popover') readonly popoverElement!: Popover

				protected override get template() {
					return html`<mo-popover .anchor=${this}>Test</mo-popover>`
				}
			}

			const fixture = new ComponentTestFixture(() => new TestPopoverAbsolute)

			it('should have absolute positioning', async () => {
				await fixture.updateComplete

				expect(getComputedStyle(fixture.component.popoverElement).position).toBe('absolute')
			})

			for (const [placement, alignment, oobcMargin, expectPlacement, expectAlignment] of positioningCases) {
				it(`should align and place itself visually relative to the anchor element when placement is ${placement} and alignment is ${alignment}`, async () => {
					fixture.component.popoverElement.placement = placement
					fixture.component.popoverElement.alignment = alignment
					fixture.component.popoverElement.open = true

					await fixture.updateComplete

					const anchorRect = fixture.component.getBoundingClientRect()
					const popoverRect = fixture.component.popoverElement.getBoundingClientRect()

					expectPlacement(popoverRect, anchorRect)
					expectAlignment(popoverRect, anchorRect)
				})

				it(`should re-correct its position should it go out of bounds when placement is ${placement} and alignment is ${alignment}`, async () => {
					fixture.component.style.margin = oobcMargin
					fixture.component.popoverElement.placement = placement
					fixture.component.popoverElement.alignment = alignment
					fixture.component.popoverElement.open = true

					fixture.component.requestUpdate()
					await fixture.updateComplete

					const popoverRect = fixture.component.popoverElement.getBoundingClientRect()
					expect(popoverRect.x + popoverRect.width).toBeLessThanOrEqual(window.innerWidth)
					expect(popoverRect.x).toBeGreaterThanOrEqual(0)
					expect(popoverRect.y + popoverRect.height).toBeLessThanOrEqual(window.innerHeight)
					expect(popoverRect.y).toBeGreaterThanOrEqual(0)
				})
			}
		})

		describe('with fixed positioning', () => {
			@component('test-popover-fixed')
			class TestPopoverFixed extends Component {
				@query('mo-popover') readonly popoverElement!: Popover

				protected override get template() {
					return html`<mo-popover fixed .anchor=${this}>Test</mo-popover>`
				}
			}

			const fixture = new ComponentTestFixture(() => new TestPopoverFixed)

			it('should have fixed positioning', async () => {
				await fixture.updateComplete

				expect(getComputedStyle(fixture.component.popoverElement).position).toBe('fixed')
			})

			for (const [placement, alignment, oobcMargin, expectPlacement, expectAlignment] of positioningCases) {
				if (placement === PopoverPlacement.InlineEnd || (placement === PopoverPlacement.BlockEnd && alignment === PopoverAlignment.End) || (placement === PopoverPlacement.BlockEnd && alignment === PopoverAlignment.Center)) {
					continue
				}
				it(`should align and place itself visually relative to the anchor element when placement is ${placement} and alignment is ${alignment}`, async () => {
					fixture.component.popoverElement.placement = placement
					fixture.component.popoverElement.alignment = alignment
					fixture.component.popoverElement.open = true

					await fixture.updateComplete

					const anchorRect = fixture.component.getBoundingClientRect()
					const popoverRect = fixture.component.popoverElement.getBoundingClientRect()

					expectPlacement(popoverRect, anchorRect)
					expectAlignment(popoverRect, anchorRect)
				})

				it(`should re-correct its position should it go out of bounds when placement is ${placement} and alignment is ${alignment}`, async () => {
					fixture.component.style.margin = oobcMargin
					fixture.component.popoverElement.placement = placement
					fixture.component.popoverElement.alignment = alignment
					fixture.component.popoverElement.open = true

					fixture.component.requestUpdate()
					await fixture.updateComplete

					const popoverRect = fixture.component.popoverElement.getBoundingClientRect()
					expect(popoverRect.x + popoverRect.width).toBeLessThanOrEqual(window.innerWidth)
					expect(popoverRect.x).toBeGreaterThanOrEqual(0)
					expect(popoverRect.y + popoverRect.height).toBeLessThanOrEqual(window.innerHeight)
					expect(popoverRect.y).toBeGreaterThanOrEqual(0)
				})
			}
		})
	})
})