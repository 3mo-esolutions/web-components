import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SplitPageHost } from './SplitPageHost.js'
import './index.js'

const settle = (milliseconds = 80) => new Promise(resolve => setTimeout(resolve, milliseconds))

/** The layout hinges on a viewport media query and the two Karma browsers sit on opposite sides of it. */
const isBelowBreakpoint = () => matchMedia('(max-width: 900px)').matches

const width = 700

describe('SplitPageHost', () => {
	const fixture = new ComponentTestFixture<SplitPageHost>(html`
		<mo-split-page-host style='display: block; width: ${width}px; height: 400px'>
			<div slot='sidebar' style='height: 100%'>Sidebar</div>
			<div>Content</div>
		</mo-split-page-host>
	`)

	const query = <T extends HTMLElement>(selector: string) => fixture.component.renderRoot.querySelector<T>(selector)!
	const sidebar = () => query('#sidebar')
	const content = () => query('#content')
	const contentToolbar = () => query('#contentToolbar')

	const open = async () => {
		fixture.component.isContentOpen = true
		await fixture.updateComplete
		await settle()
	}

	it('should reflect "isContentOpen" as an attribute', async () => {
		expect(fixture.component.hasAttribute('isContentOpen')).toBeFalse()

		fixture.component.isContentOpen = true
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('isContentOpen')).toBeTrue()

		fixture.component.isContentOpen = false
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('isContentOpen')).toBeFalse()
	})

	it('should open the content once "contentPageHeading" is set', async () => {
		expect(fixture.component.isContentOpen).toBeFalse()

		fixture.component.contentPageHeading = 'Reports'
		await fixture.updateComplete

		expect(fixture.component.isContentOpen).toBeTrue()
	})

	it('should adopt the heading a hosted page announces and open the content', async () => {
		query('lit-page-host').dispatchEvent(new CustomEvent('pageHeadingChange', { detail: 'Reports', bubbles: true }))
		await fixture.updateComplete

		expect(fixture.component.contentPageHeading).toBe('Reports')
		expect(fixture.component.isContentOpen).toBeTrue()
	})

	it('should render the current heading in the content toolbar', async () => {
		fixture.component.contentPageHeading = 'Reports'
		await fixture.updateComplete

		expect(contentToolbar().querySelector('mo-heading')!.textContent).toContain('Reports')
	})

	it('should point the back arrow against the reading direction', async () => {
		const icon = () => contentToolbar().querySelector('mo-icon-button')!.getAttribute('icon')

		expect(icon()).toBe('arrow_back')

		fixture.component.style.direction = 'rtl'
		await fixture.update()

		expect(icon()).toBe('arrow_forward')
	})

	describe('above the 900px breakpoint', () => {
		it('should place the sidebar beside the content', async () => {
			if (isBelowBreakpoint()) {
				pending('the viewport is below the 900px breakpoint')
			}
			await settle()

			expect(sidebar().getBoundingClientRect().width).toBeGreaterThan(0)
			expect(content().getBoundingClientRect().width).toBeGreaterThan(0)
			expect(sidebar().getBoundingClientRect().right).toBeLessThanOrEqual(content().getBoundingClientRect().left + 1)
		})

		it('should size the sidebar via "--mo-split-page-host-sidebar-width"', async () => {
			if (isBelowBreakpoint()) {
				pending('the viewport is below the 900px breakpoint')
			}
			fixture.component.style.setProperty('--mo-split-page-host-sidebar-width', '250px')
			await settle()

			expect(sidebar().getBoundingClientRect().width).toBeCloseTo(250, -1)
		})

		it('should not show the content toolbar', () => {
			if (isBelowBreakpoint()) {
				pending('the viewport is below the 900px breakpoint')
			}

			expect(getComputedStyle(contentToolbar()).display).toBe('none')
		})
	})

	describe('below the 900px breakpoint', () => {
		it('should show only the sidebar while no content is open', async () => {
			if (!isBelowBreakpoint()) {
				pending('the viewport is above the 900px breakpoint')
			}
			await settle()

			expect(getComputedStyle(content()).display).toBe('none')
			expect(sidebar().getBoundingClientRect().width).toBeCloseTo(width, -1)
		})

		it('should show only the content once it is open', async () => {
			if (!isBelowBreakpoint()) {
				pending('the viewport is above the 900px breakpoint')
			}

			await open()

			expect(getComputedStyle(sidebar()).display).toBe('none')
			expect(content().getBoundingClientRect().width).toBeCloseTo(width, -1)
		})

		it('should show the content toolbar with the back button', async () => {
			if (!isBelowBreakpoint()) {
				pending('the viewport is above the 900px breakpoint')
			}

			await open()

			expect(getComputedStyle(contentToolbar()).display).toBe('flex')
			expect(contentToolbar().querySelector('mo-icon-button')!.getBoundingClientRect().width).toBeGreaterThan(0)
		})
	})
})