import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Drawer } from '@3mo/drawer'
import './index.js'
import { fakeNavigation as navigation, fakeNavigationLink } from './fakeNavigation.test.js'
import { NavigationDrawer } from './NavigationDrawer.js'

describe('NavigationDrawer', () => {
	// Another suite stubs "showModal" out globally for the whole bundle, so the native
	// implementation is recovered from a pristine realm for the duration of this suite.
	const stubbedShowModal = HTMLDialogElement.prototype.showModal
	beforeAll(() => {
		const iframe = document.createElement('iframe')
		document.body.append(iframe)
		HTMLDialogElement.prototype.showModal = (iframe.contentWindow as unknown as { HTMLDialogElement: typeof HTMLDialogElement }).HTMLDialogElement.prototype.showModal
		iframe.remove()
	})
	afterAll(() => HTMLDialogElement.prototype.showModal = stubbedShowModal)

	const fixture = new ComponentTestFixture(() => {
		const drawer = new NavigationDrawer()
		drawer.heading = 'Business Suite'
		drawer.navigations = [fakeNavigationLink('Dashboard'), navigation('Settings')]
		return drawer
	})

	const drawerElement = () => fixture.component.renderRoot.querySelector<Drawer>('mo-drawer')!
	const treeItems = () => {
		const tree = fixture.component.renderRoot.querySelector('mo-navigation-tree')
		return [...tree?.shadowRoot?.querySelectorAll<HTMLElement>('mo-navigation-tree-item') ?? []]
	}

	it('should render a row for each navigation', () => {
		expect(treeItems().length).toBe(2)
	})

	it('should render its heading', () => {
		expect(fixture.component.renderRoot.textContent).toContain('Business Suite')
	})

	it('should open the drawer along with itself', async () => {
		fixture.component.open = true
		await fixture.updateComplete

		expect(drawerElement().open).toBeTrue()
	})

	it('should dispatch openChange whenever it opens or closes', async () => {
		const handler = jasmine.createSpy('openChange')
		fixture.component.addEventListener('openChange', (e: Event) => handler((e as CustomEvent<boolean>).detail))

		fixture.component.open = true
		await fixture.updateComplete
		fixture.component.open = false
		await fixture.updateComplete

		expect(handler).toHaveBeenCalledWith(true)
		expect(handler).toHaveBeenCalledWith(false)
	})

	it('should close itself when a destination is invoked', async () => {
		fixture.component.open = true
		await fixture.updateComplete

		treeItems()[0]!.click()
		await fixture.updateComplete

		expect(fixture.component.open).toBeFalse()
	})

	it('should report an invocation to whoever presented it', async () => {
		const handler = jasmine.createSpy('invoke')
		fixture.component.addEventListener('invoke', handler)
		fixture.component.open = true
		await fixture.updateComplete

		treeItems()[0]!.click()

		expect(handler).toHaveBeenCalled()
	})

	it('should hand focus to its navigations', () => {
		const tree = fixture.component.renderRoot.querySelector('mo-navigation-tree')!
		const focusSpy = spyOn(tree, 'focus')

		fixture.component.focus()

		expect(focusSpy).toHaveBeenCalled()
	})
})