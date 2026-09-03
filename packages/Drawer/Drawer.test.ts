import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Drawer } from './Drawer.js'

describe('Drawer', () => {
	const fixture = new ComponentTestFixture<Drawer>(html`
		<mo-drawer>Drawer content</mo-drawer>
	`)

	it('should reflect open attribute', async () => {
		expect(fixture.component.open).toBeFalse()

		fixture.component.open = true
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('open')).toBeTrue()
	})

	it('should close drawer on Escape key', async () => {
		fixture.component.open = true
		await fixture.updateComplete

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
		await fixture.updateComplete

		expect(fixture.component.open).toBeFalse()
	})
})