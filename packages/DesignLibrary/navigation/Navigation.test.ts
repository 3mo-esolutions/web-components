import { ComponentTestFixture } from '@a11d/lit-testing'
import { Key } from '@a11d/lit-application'
import { Navigation } from './Navigation.js'

describe('Navigation', () => {
	describe('Alt key activation', () => {
		const fixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.navigations = [
				{ label: 'Home', component: undefined! },
			]
			return navigation
		})
		beforeAll(() => (globalThis as any).manifest = {})

		it('should focus on the first navigation item', () => {
			const firstNavItemSpy = spyOn(fixture.component.navigationItems[0]!, 'focus')
			const event = new KeyboardEvent('keydown', { key: Key.Alt, bubbles: true, cancelable: true, altKey: true })

			window.dispatchEvent(event)

			expect(firstNavItemSpy).toHaveBeenCalled()
		})

		it('should prevent activation if any input is focused', () => {
			const input = document.createElement('input')
			document.body.appendChild(input)
			const firstNavItemSpy = spyOn(fixture.component.navigationItems[0]!, 'focus')
			const event = new KeyboardEvent('keydown', { key: Key.Alt, bubbles: true, cancelable: true, altKey: true, })

			input.focus()
			input.dispatchEvent(event)

			expect(firstNavItemSpy).not.toHaveBeenCalled()
		})
	})
})