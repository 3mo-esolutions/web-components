import { ComponentTestFixture } from '@a11d/lit-testing'
import { Key } from '@a11d/lit-application'
import { Navigation } from './Navigation.js'
import { NavigationLink } from './INavigation.js'

/** Awaits the resize observations and microtask-batched measurements the overflow controller settles through. */
const settle = async (component: Navigation) => {
	for (let i = 0; i < 10; i++) {
		await component.updateComplete
		await new Promise(resolve => requestAnimationFrame(resolve))
	}
	await component.updateComplete
}

describe('Navigation', () => {
	describe('collapsing into the hamburger', () => {
		const fixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.style.display = 'block'
			navigation.navigations = new Array(10).fill(undefined).map((_, index) =>
				new NavigationLink({ label: `Navigation ${index + 1}`, component: { urlMatches: () => false } } as any))
			return navigation
		})
		beforeAll(() => (globalThis as any).manifest = {})

		const hamburgerVisible = () => getComputedStyle(fixture.component.menuButton!).display !== 'none'

		it('should keep the navigation-bar as long as all items fit', async () => {
			fixture.component.style.width = '3000px'

			await settle(fixture.component)

			expect(fixture.component.mobileNavigation).toBeFalse()
			expect(hamburgerVisible()).toBeFalse()
		})

		it('should collapse into the hamburger once the items no longer fit', async () => {
			fixture.component.style.width = '400px'

			await settle(fixture.component)

			expect(fixture.component.mobileNavigation).toBeTrue()
			expect(hamburgerVisible()).toBeTrue()
		})

		it('should restore the navigation-bar once the items fit again', async () => {
			fixture.component.style.width = '400px'
			await settle(fixture.component)
			expect(fixture.component.mobileNavigation).toBeTrue()

			fixture.component.style.width = '3000px'
			await settle(fixture.component)

			expect(fixture.component.mobileNavigation).toBeFalse()
		})
	})

	describe('Alt key activation', () => {
		const fixture = new ComponentTestFixture(() => {
			const navigation = new Navigation()
			navigation.navigations = [
				new NavigationLink({ label: 'Home', component: { urlMatches: () => false } } as any)
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