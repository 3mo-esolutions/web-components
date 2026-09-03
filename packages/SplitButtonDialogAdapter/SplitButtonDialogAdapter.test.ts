import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DialogActionKey } from '@a11d/lit-application'
import { Dialog } from '@3mo/dialog'
import './index.js'

class TestSplitButtonChild extends HTMLElement { }
customElements.define('test-split-button-child', TestSplitButtonChild)

describe('SplitButtonDialogAdapter', () => {
	const fixture = new ComponentTestFixture<Dialog>(html`
		<mo-dialog>
			<mo-split-button slot='primaryAction'>
				<test-split-button-child></test-split-button-child>
				<mo-button slot='more'>More</mo-button>
			</mo-split-button>
		</mo-dialog>
	`)

	const child = () => fixture.component.querySelector<HTMLElement>('test-split-button-child')!

	afterEach(() => Dialog.executingActionAdaptersByComponent.delete(TestSplitButtonChild))

	it('should delegate the executing state to the adapter registered for the split-button\'s first child', async () => {
		const adapter = jasmine.createSpy('adapter')
		Dialog.executingActionAdaptersByComponent.set(TestSplitButtonChild, adapter)

		fixture.component.executingAction = DialogActionKey.Primary
		await fixture.updateComplete

		expect(adapter).toHaveBeenCalledOnceWith(child(), true)

		fixture.component.executingAction = undefined
		await fixture.updateComplete

		expect(adapter).toHaveBeenCalledWith(child(), false)
	})

	it('should do nothing when no adapter is registered for the first child', async () => {
		Dialog.executingActionAdaptersByComponent.delete(TestSplitButtonChild)
		const outerHTMLBefore = child().outerHTML

		fixture.component.executingAction = DialogActionKey.Primary

		await expectAsync(fixture.component.updateComplete).toBeResolved()
		expect(child().outerHTML).toBe(outerHTMLBefore)
	})
})