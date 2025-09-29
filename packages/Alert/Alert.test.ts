import { ComponentTestFixture } from '@a11d/lit-testing'
import type { ExpandCollapseIconButton } from '@3mo/expand-collapse-icon-button'
import { Alert, AlertType } from './Alert.js'

describe('Alert', () => {
	const fixture = new ComponentTestFixture<Alert>('mo-alert')

	it('should have the default type "info"', () => {
		expect(fixture.component.type).toBe(AlertType.Info)
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
	})

	describe('Default slot', () => {
		const getSlotHeight = () => getComputedStyle(fixture.component.renderRoot.querySelector('slot:not([name])')!).height

		it('should set height to 0 when there are no assigned content', () => expect(getSlotHeight()).toBe('0px'))

		it('should set height to auto when there are assigned content', async () => {
			fixture.component.textContent = 'Test content'

			await fixture.update()

			expect(getSlotHeight()).not.toBe('auto')
		})
	})
})