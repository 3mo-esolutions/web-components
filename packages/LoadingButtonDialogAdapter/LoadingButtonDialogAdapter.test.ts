import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DialogActionKey } from '@a11d/lit-application'
import { type Dialog } from '@3mo/dialog'
import { type LoadingButton } from '@3mo/loading-button'
import './index.js'

describe('LoadingButtonDialogAdapter', () => {
	const fixture = new ComponentTestFixture<Dialog>(html`
		<mo-dialog>
			<mo-loading-button slot='primaryAction' id='primary'>Save</mo-loading-button>
			<mo-loading-button slot='secondaryAction' id='secondary'>Discard</mo-loading-button>
		</mo-dialog>
	`)

	const primaryButton = () => fixture.component.querySelector<LoadingButton>('#primary')!
	const secondaryButton = () => fixture.component.querySelector<LoadingButton>('#secondary')!

	it('should set `loading` on the primary loading-button while the primary action is executing and unset it once it settles', async () => {
		fixture.component.executingAction = DialogActionKey.Primary
		await fixture.updateComplete

		expect(primaryButton().loading).toBe(true)

		fixture.component.executingAction = undefined
		await fixture.updateComplete

		expect(primaryButton().loading).toBe(false)
	})

	it('should set `loading` only on the button of the executing action, leaving the other action\'s button untouched', async () => {
		fixture.component.executingAction = DialogActionKey.Secondary
		await fixture.updateComplete

		expect(secondaryButton().loading).toBe(true)
		expect(primaryButton().loading).toBe(false)
	})
})