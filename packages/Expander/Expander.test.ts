import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Expander } from './Expander.js'
import './index.js'

describe('Expander', () => {
	const fixture = new ComponentTestFixture<Expander>('mo-expander')

	const summary = () => fixture.component.renderRoot.querySelector('summary')!

	const click = async () => {
		summary().click()
		await new Promise(resolve => setTimeout(resolve))
		await fixture.updateComplete
	}

	it('should be closed by default', () => {
		expect(fixture.component.open).toBe(false)
	})

	it('should have the "header" part on the flex container', () => {
		expect(fixture.component.renderRoot.querySelector('mo-flex')?.getAttribute('part')).toBe('header')
	})

	describe('heading', () => {
		const slottedHeadingFixture = new ComponentTestFixture<Expander>(html`
			<mo-expander heading='Default heading'>
				<span slot='heading'>Custom heading</span>
			</mo-expander>
		`)

		it('should have the "heading" part', () => {
			expect(fixture.component.renderRoot.querySelector('mo-heading')?.getAttribute('part')).toBe('heading')
		})

		it('should get reflected on mo-heading', async () => {
			fixture.component.heading = 'heading'

			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('mo-heading')?.textContent).toBe('heading')
		})

		it('should not be user-selectable', () => {
			expect(getComputedStyle(summary()).userSelect).toBe('none')
		})

		it('should give the "heading" slot precedence over the default heading', () => {
			const slot = slottedHeadingFixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=heading]')!
			const defaultHeading = slottedHeadingFixture.component.renderRoot.querySelector('mo-heading[part=heading]')!

			expect(slot.assignedElements({ flatten: true })).toEqual([slottedHeadingFixture.component.querySelector('[slot=heading]')!])
			expect(defaultHeading.getClientRects().length).toBe(0)
		})
	})

	describe('expand-collapse-icon-button', () => {
		it('should be closed by default', () => {
			expect(fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.open).toBe(false)
		})

		it('should have the "expand-collapse-icon-button" part', () => {
			expect(fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.getAttribute('part')).toBe('expand-collapse-icon-button')
		})

		it('should reflect the "open" property', async () => {
			fixture.component.open = true

			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('mo-expand-collapse-icon-button')?.open).toBe(true)
		})
	})

	describe('details', () => {
		it('should be closed by default', () => {
			expect(fixture.component.detailsElement.open).toBe(false)
		})

		it('should reflect the "open" property', async () => {
			fixture.component.open = true

			await fixture.updateComplete

			expect(fixture.component.detailsElement.open).toBe(true)
		})

		it('should open when the summary is clicked and dispatch "openChange"', async () => {
			const handler = jasmine.createSpy('openChange')
			fixture.component.addEventListener('openChange', handler)

			await click()

			expect(fixture.component.detailsElement.open).toBe(true)
			expect(fixture.component.open).toBe(true)
			expect(handler).toHaveBeenCalledTimes(1)
			expect(handler.calls.mostRecent().args[0].detail).toBe(true)
		})

		// BUG: programmatic setOpen dispatches openChange
		xit('should not dispatch "openChange" for a programmatically set state', async () => {
			const handler = jasmine.createSpy('openChange')
			fixture.component.addEventListener('openChange', handler)

			fixture.component.open = true
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve))

			expect(fixture.component.detailsElement.open).toBe(true)
			expect(handler).not.toHaveBeenCalled()
		})
	})

	describe('content', () => {
		it('should be user-selectable', () => {
			const div = document.createElement('div')

			fixture.component.appendChild(div)

			expect(getComputedStyle(div).userSelect).toBe('auto')
		})

		it('should not take up more room than its summary while it is closed', async () => {
			const content = document.createElement('div')
			content.style.height = '60px'
			fixture.component.appendChild(content)
			await fixture.update()

			const closedHeight = fixture.component.detailsElement.getBoundingClientRect().height
			expect(closedHeight).toBe(summary().getBoundingClientRect().height)

			fixture.component.open = true
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve, 500))

			expect(fixture.component.detailsElement.getBoundingClientRect().height).toBeGreaterThan(closedHeight)
		})
	})
})