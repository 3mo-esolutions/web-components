import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FabGroup } from './FabGroup.js'
import '@3mo/fab'

describe('FabGroup', () => {
	const fixture = new ComponentTestFixture<FabGroup>(html`
		<mo-fab-group>
			<mo-fab icon='add'></mo-fab>
		</mo-fab-group>
	`)

	it('should reflect open attribute', async () => {
		expect(fixture.component.open).toBeFalse()

		fixture.component.open = true
		await fixture.updateComplete

		expect(fixture.component.hasAttribute('open')).toBeTrue()
	})

	it('should close when clicking outside', async () => {
		fixture.component.open = true
		await fixture.updateComplete

		document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		await fixture.updateComplete

		expect(fixture.component.open).toBeFalse()
	})
})