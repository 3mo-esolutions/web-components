import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Toolbar } from './Toolbar.js'
import './index.js'

/** Awaits the resize observations and microtask-batched measurements the controller settles through. */
const settle = async (component: Toolbar) => {
	for (let i = 0; i < 10; i++) {
		await component.updateComplete
		await new Promise(resolve => requestAnimationFrame(resolve))
	}
	await component.updateComplete
}

describe('Toolbar', () => {
	// The width of 305px leaves the pane with 305px minus the overflow icon-button,
	// which fits exactly two of the 100px items for any plausible icon-button width.
	const fixture = new ComponentTestFixture<Toolbar>(html`
		<mo-toolbar style='display: block; width: 500px'>
			<div style='min-width: 100px'>Item 1</div>
			<div style='min-width: 100px'>Item 2</div>
			<div style='min-width: 100px'>Item 3</div>
			<div style='min-width: 100px'>Item 4</div>
		</mo-toolbar>
	`)

	const items = () => [...fixture.component.children] as Array<HTMLElement>
	const overflowedItems = () => items().filter(item => item.slot === 'overflow-content')
	const iconButton = () => fixture.component.renderRoot.querySelector('mo-icon-button')!

	beforeEach(() => settle(fixture.component))

	it('should keep all fitting items in the pane and disable the overflow icon-button', () => {
		expect(overflowedItems()).toEqual([])
		expect(iconButton().disabled).toBeTrue()
	})

	it('should move items which do not fit into the overflow slot and enable the icon-button', async () => {
		fixture.component.style.width = '305px'

		await settle(fixture.component)

		expect(overflowedItems()).toEqual(items().slice(2))
		expect(iconButton().disabled).toBeFalse()
	})

	it('should move items back into the pane once they fit again', async () => {
		fixture.component.style.width = '305px'
		await settle(fixture.component)
		expect(overflowedItems().length).toBe(2)

		fixture.component.style.width = '500px'
		await settle(fixture.component)

		expect(overflowedItems()).toEqual([])
	})

	it('should never overflow items with the "data-no-overflow" attribute', async () => {
		items()[3]!.setAttribute('data-no-overflow', '')
		fixture.component.style.width = '305px'

		await settle(fixture.component)

		expect(overflowedItems()).toEqual(items().slice(1, 3))
	})

	it('should overflow all items when collapsed and restore them when expanded again', async () => {
		fixture.component.collapsed = true
		await settle(fixture.component)
		expect(overflowedItems()).toEqual(items())

		fixture.component.collapsed = false
		await settle(fixture.component)

		expect(overflowedItems()).toEqual([])
	})
})