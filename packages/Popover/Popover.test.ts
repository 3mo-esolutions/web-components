import { Component, component, css, html, property, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PopoverAlignment, PopoverCssAnchorPositionController, PopoverPlacement, type Popover, type PopoverMode } from './index.js'

describe('Popover', () => {
	@component('test-generic-popover')
	class GenericPopover extends Component {
		@query('mo-popover') readonly popoverElement!: Popover

		protected override get template() {
			return html`<mo-popover .anchor=${this}>Test</mo-popover>`
		}
	}

	describe('open focus and state management', () => {
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
		const customTarget = new ComponentTestFixture(() => new CustomTargetPopover)

		it('should ignore "display: flex" when not opened', () => {
			expect(getComputedStyle(generic.component.popoverElement).display).toBe('none')

			generic.component.popoverElement.style.display = 'flex'

			expect(getComputedStyle(generic.component.popoverElement).display).toBe('none')
		})

		it('should toggle and dispatch openChange event when open changes', async () => {
			const openChangeSpy = jasmine.createSpy()
			generic.component.popoverElement.addEventListener<any>('openChange', (e: CustomEvent<boolean>) => openChangeSpy(e.detail))

			generic.component.popoverElement.open = true
			await generic.updateComplete
			await new Promise(r => setTimeout(r, 50))

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
			await new Promise(r => setTimeout(r))

			generic.component.popoverElement.open = false

			await generic.updateComplete
			await new Promise(r => setTimeout(r))

			expect(generic.component.focus).toHaveBeenCalled()
		})

		it('should not return focus to the anchor when a hint popover closes', async () => {
			spyOn(generic.component!, 'focus')
			generic.component.popoverElement.mode = 'hint'
			generic.component.popoverElement.open = true

			await generic.updateComplete
			await new Promise(r => setTimeout(r, 50))

			generic.component.popoverElement.open = false

			await generic.updateComplete
			await new Promise(r => setTimeout(r, 50))

			expect(generic.component.popoverElement.open).toBe(false)
			expect(generic.component.focus).not.toHaveBeenCalled()
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

		it('should toggle close the popover when clicked the anchor', async () => {
			fixture1.component.popoverElement.open = true

			await fixture1.updateComplete

			fixture1.component.click()

			expect(fixture1.component.popoverElement.open).toBe(false)
		})

		it('should not close the popover when clicked inside of the popover', async () => {
			fixture1.component.popoverElement.open = true

			await fixture1.updateComplete

			fixture1.component.popoverElement.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(fixture1.component.popoverElement.open).toBe(true)
		})

		it('should not close when mode is "manual"', async () => {
			fixture1.component.popoverElement.mode = 'manual'
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

	describe('mode', () => {
		const fixture = new ComponentTestFixture(() => new GenericPopover)

		for (const mode of ['auto', 'manual', 'hint'] as Array<PopoverMode>) {
			it(`should map mode to the native popover attribute - ${mode}`, async () => {
				fixture.component.popoverElement.mode = mode

				await fixture.updateComplete

				expect(fixture.component.popoverElement.getAttribute('popover')).toBe(mode)
			})
		}
	})

	describe('keyboard interaction', () => {
		const fixture = new ComponentTestFixture(() => new GenericPopover)

		const pressEnterOnAnchor = () => {
			const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true })
			fixture.component.dispatchEvent(event)
			return event
		}

		it('should open when Enter is pressed on the anchor while closed', async () => {
			pressEnterOnAnchor()

			await fixture.updateComplete

			expect(fixture.component.popoverElement.open).toBe(true)
		})

		it('should prevent the browser\'s synthetic click when opening via Enter', async () => {
			const event = pressEnterOnAnchor()

			await fixture.updateComplete

			expect(fixture.component.popoverElement.open).toBe(true)
			expect(event.defaultPrevented).toBe(true)
		})
	})

	describe('shouldOpen', () => {
		const fixture = new ComponentTestFixture(() => new GenericPopover)

		it('should consult the custom shouldOpen predicate instead of the default anchor check', async () => {
			const shouldOpen = jasmine.createSpy('shouldOpen').and.returnValue(false)
			fixture.component.popoverElement.shouldOpen = shouldOpen

			fixture.component.click()
			await fixture.updateComplete

			expect(shouldOpen).toHaveBeenCalled()
			expect(fixture.component.popoverElement.open).toBe(false)

			shouldOpen.and.returnValue(true)

			document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
			await fixture.updateComplete

			expect(fixture.component.popoverElement.open).toBe(true)
		})
	})

	describe('positioning', () => {
		const fixture = new ComponentTestFixture<HTMLDivElement>(html`
			<div>
				<div id='anchor' style='position: fixed; inset-block-start: 50%; inset-inline-start: 50%; width: 20px; height: 20px'></div>
				<mo-popover style='width: 40px; height: 20px'>Popover</mo-popover>
			</div>
		`)

		const anchor = () => fixture.component.querySelector<HTMLElement>('#anchor')!
		const popover = () => fixture.component.querySelector('mo-popover')!

		const openAt = async (placement: PopoverPlacement, alignment = PopoverAlignment.Start) => {
			popover().anchor = anchor()
			popover().placement = placement
			popover().alignment = alignment
			popover().open = true
			await popover().updateComplete
			await new Promise(r => setTimeout(r, 100))
			return { anchorRect: anchor().getBoundingClientRect(), popoverRect: popover().getBoundingClientRect() }
		}

		it('should settle below and aligned to the anchor when placed at the block end', async () => {
			const { anchorRect, popoverRect } = await openAt(PopoverPlacement.BlockEnd)

			expect(popoverRect.top).toBeGreaterThanOrEqual(anchorRect.bottom - 1)
			expect(Math.abs(popoverRect.left - anchorRect.left)).toBeLessThanOrEqual(1)
		})

		it('should settle above and aligned to the anchor when placed at the block start', async () => {
			const { anchorRect, popoverRect } = await openAt(PopoverPlacement.BlockStart)

			expect(popoverRect.bottom).toBeLessThanOrEqual(anchorRect.top + 1)
			expect(Math.abs(popoverRect.left - anchorRect.left)).toBeLessThanOrEqual(1)
		})

		it('should settle after and aligned to the anchor when placed at the inline end', async () => {
			const { anchorRect, popoverRect } = await openAt(PopoverPlacement.InlineEnd)

			expect(popoverRect.left).toBeGreaterThanOrEqual(anchorRect.right - 1)
			expect(Math.abs(popoverRect.top - anchorRect.top)).toBeLessThanOrEqual(1)
		})

		it('should settle before and aligned to the anchor when placed at the inline start', async () => {
			const { anchorRect, popoverRect } = await openAt(PopoverPlacement.InlineStart)

			expect(popoverRect.right).toBeLessThanOrEqual(anchorRect.left + 1)
			expect(Math.abs(popoverRect.top - anchorRect.top)).toBeLessThanOrEqual(1)
		})

		it('should center the popover on the anchor when aligned to the center', async () => {
			const { anchorRect, popoverRect } = await openAt(PopoverPlacement.BlockEnd, PopoverAlignment.Center)

			expect(popoverRect.top).toBeGreaterThanOrEqual(anchorRect.bottom - 1)
			expect(Math.abs((popoverRect.left + popoverRect.right) / 2 - (anchorRect.left + anchorRect.right) / 2)).toBeLessThanOrEqual(1)
		})

		it('should tether to an anchor living in a different shadow tree', async () => {
			const anchorHost = new PopoverAnchorHost()
			const popover = document.createElement('mo-popover')
			try {
				document.body.appendChild(anchorHost)
				await anchorHost.updateComplete

				popover.style.width = '40px'
				popover.style.height = '20px'
				popover.textContent = 'Popover'
				popover.anchor = anchorHost.anchorElement
				document.body.appendChild(popover)
				popover.open = true
				await popover.updateComplete
				await new Promise(r => setTimeout(r, 100))

				const anchorRect = anchorHost.anchorElement.getBoundingClientRect()
				const popoverRect = popover.getBoundingClientRect()

				expect(popoverRect.top).toBeGreaterThanOrEqual(anchorRect.bottom - 1)
				expect(Math.abs(popoverRect.left - anchorRect.left)).toBeLessThanOrEqual(1)
			} finally {
				popover.remove()
				anchorHost.remove()
			}
		})
	})

	describe('coordinates', () => {
		const fixture = new ComponentTestFixture<Popover>(html`<mo-popover style='width: 40px; height: 20px'>Popover</mo-popover>`)

		const openAt = async (coordinates: [number, number]) => {
			fixture.component.coordinates = coordinates
			fixture.component.open = true
			await fixture.updateComplete
			await new Promise(r => setTimeout(r, 100))
			return fixture.component.getBoundingClientRect()
		}

		it('should position at the given coordinates instead of the anchor', async () => {
			const rect = await openAt([120, 200])

			expect(Math.abs(rect.left - 120)).toBeLessThanOrEqual(1)
			expect(Math.abs(rect.top - 200)).toBeLessThanOrEqual(1)
		})

		it('should follow coordinate updates while open', async () => {
			await openAt([120, 200])

			fixture.component.coordinates = [250, 300]
			await fixture.updateComplete
			await new Promise(r => setTimeout(r, 100))

			const rect = fixture.component.getBoundingClientRect()
			expect(Math.abs(rect.left - 250)).toBeLessThanOrEqual(1)
			expect(Math.abs(rect.top - 300)).toBeLessThanOrEqual(1)
		})

		const guarded = PopoverCssAnchorPositionController.supported ? it : xit

		guarded('should remove its virtual anchor from the document when disconnected', async () => {
			const virtualAnchors = () => document.querySelectorAll('mo-popover-virtual-anchor').length
			const before = virtualAnchors()

			await openAt([120, 200])

			expect(virtualAnchors()).toBe(before + 1)

			fixture.component.remove()

			expect(virtualAnchors()).toBe(before)
		})
	})
})

@component('test-popover-anchor-host')
class PopoverAnchorHost extends Component {
	@query('#anchor') readonly anchorElement!: HTMLElement

	static override get styles() {
		return css`
			#anchor {
				position: fixed;
				inset-block-start: 50%;
				inset-inline-start: 50%;
				width: 20px;
				height: 20px;
			}
		`
	}

	protected override get template() {
		return html`<div id='anchor'></div>`
	}
}