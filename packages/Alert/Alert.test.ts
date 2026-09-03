import { html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { ExpandCollapseIconButton } from '@3mo/expand-collapse-icon-button'
import { Alert, AlertType } from './Alert.js'
import './index.js'

describe('Alert', () => {
	const fixture = new ComponentTestFixture<Alert>('mo-alert')

	const slotElement = () => fixture.component.renderRoot.querySelector('slot:not([name])')!
	const slotHeight = () => getComputedStyle(slotElement()).height

	const settleContentTransition = () => new Promise(resolve => setTimeout(resolve, 350))

	const contentHeight = 40

	const assignContent = async () => {
		render(html`<div style='height: ${contentHeight}px'>Test content</div>`, fixture.component)
		await fixture.update()
	}

	it('should have the default type "info"', () => {
		expect(fixture.component.type).toBe(AlertType.Info)
	})

	it('should expose role "alert" so its content is announced', () => {
		const grid = fixture.component.renderRoot.querySelector('mo-grid')!

		expect(grid.getAttribute('role')).toBe('alert')
		expect(grid.contains(slotElement())).toBe(true)
	})

	describe('Type icon', () => {
		const getIcon = () => fixture.component.renderRoot.querySelector('mo-icon')

		for (const [type, icon] of Alert['iconByType']) {
			it(`should render the icon "${icon}" for type "${type}"`, async () => {
				fixture.component.type = type

				await fixture.updateComplete

				expect(getIcon()?.icon).toBe(icon)
			})
		}
	})

	describe('Heading', () => {
		const getHeading = () => fixture.component.renderRoot.querySelector('mo-heading')

		it('should not render when not set', () => expect(getHeading()).toBeNull())

		it('should render when set', async () => {
			fixture.component.heading = 'Test'

			await fixture.updateComplete

			const heading = getHeading()
			expect(heading).not.toBeNull()
			expect(heading?.textContent).toBe('Test')
		})
	})

	describe('Expand/collapse icon-button', () => {
		const getExpandCollapseButton = () => fixture.component.renderRoot.querySelector<ExpandCollapseIconButton>('mo-expand-collapse-icon-button')

		it('should not be rendered when not collapsible', () => expect(getExpandCollapseButton()).toBeNull())

		it('should not be rendered when heading is not set', async () => {
			fixture.component.collapsible = true

			await fixture.updateComplete

			expect(getExpandCollapseButton()).toBeNull()
		})

		it('should be rendered when collapsible', async () => {
			fixture.component.collapsible = true
			fixture.component.heading = 'Test'

			await fixture.updateComplete

			expect(getExpandCollapseButton()).not.toBeNull()
		})

		it('should toggle the "open" property and dispatch the "openChange" when clicked', async () => {
			const openChangeSpy = spyOn(fixture.component.openChange, 'dispatch')
			fixture.component.collapsible = true
			fixture.component.heading = 'Test'
			await fixture.updateComplete
			const iconButton = getExpandCollapseButton()

			iconButton?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			expect(fixture.component.open).toBe(true)
			expect(openChangeSpy).toHaveBeenCalledWith(true)

			iconButton?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			expect(fixture.component.open).toBe(false)
			expect(openChangeSpy).toHaveBeenCalledWith(false)
		})

		it('should not dispatch "openChange" for a programmatically set "open", as only the interaction reports', async () => {
			const handler = jasmine.createSpy('openChange')
			fixture.component.addEventListener('openChange', handler)
			fixture.component.collapsible = true
			fixture.component.heading = 'Test'
			await fixture.updateComplete

			fixture.component.open = true
			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector<ExpandCollapseIconButton>('mo-expand-collapse-icon-button')?.open).toBe(true)
			expect(handler).not.toHaveBeenCalled()
		})
	})

	describe('Default slot', () => {
		it('should set height to 0 when there are no assigned content', () => expect(slotHeight()).toBe('0px'))

		it('should size the content to its own height once content is assigned', async () => {
			await assignContent()
			await settleContentTransition()

			expect(parseFloat(slotHeight())).toBeCloseTo(contentHeight, 0)
		})
	})

	describe('Collapsible content', () => {
		beforeEach(async () => {
			fixture.component.heading = 'Test'
			fixture.component.collapsible = true
			await assignContent()
			await settleContentTransition()
		})

		it('should collapse the content to zero height while collapsible and not open', () => {
			expect(fixture.component.open).toBe(false)
			expect(slotElement().hasAttribute('data-collapsed')).toBe(true)
			expect(slotHeight()).toBe('0px')
		})

		it('should reveal the content once opened', async () => {
			fixture.component.open = true
			await fixture.updateComplete
			await settleContentTransition()

			expect(slotElement().hasAttribute('data-collapsed')).toBe(false)
			expect(parseFloat(slotHeight())).toBeCloseTo(contentHeight, 0)
		})
	})
})