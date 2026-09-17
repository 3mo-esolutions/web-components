import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FabGroup } from './FabGroup.js'
import '@3mo/fab'
import './index.js'

describe('FabGroup', () => {
	const fixture = new ComponentTestFixture<FabGroup>(html`
		<mo-fab-group>
			<mo-fab icon='add'></mo-fab>
		</mo-fab-group>
	`)

	it('should reflect open attribute', async () => {
		expect(fixture.component.open).toBe(false)

		fixture.component.open = true
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('open')).toBe(true)
	})

	it('should close when clicking outside', async () => {
		fixture.component.open = true
		await fixture.updateComplete

		document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		await fixture.updateComplete

		expect(fixture.component.open).toBe(false)
	})
})