import { Component, component, html, property, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Popover } from './index.js'

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
			await new Promise(r => setTimeout(r))

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
})