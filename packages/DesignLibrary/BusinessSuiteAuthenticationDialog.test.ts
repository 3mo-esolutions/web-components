import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { ApplicationTopLayer, DialogActionKey } from '@a11d/lit-application'
import { type LoadingButton } from '@3mo/loading-button'
import '@3mo/loading-button-dialog-adapter'
import '@3mo/flex'
import { type BusinessSuiteAuthenticationDialog } from './BusinessSuiteAuthenticationDialog.js'

describe('BusinessSuiteAuthenticationDialog', () => {
	const fixture = new ComponentTestFixture<BusinessSuiteAuthenticationDialog>(html`
		<mo-business-suite-authentication-dialog>
			<mo-loading-button slot='primaryAction'>Login</mo-loading-button>
			<span>Credentials</span>
		</mo-business-suite-authentication-dialog>
	`)

	const primaryButton = () => fixture.component.querySelector<LoadingButton>('mo-loading-button')!

	it('should dispatch pageHeadingChange when the heading changes', async () => {
		const pageHeadingChange = jasmine.createSpy('pageHeadingChange')
		fixture.component.addEventListener<any>('pageHeadingChange', (e: CustomEvent<string>) => pageHeadingChange(e.detail))

		fixture.component.heading = 'Sign in'
		await fixture.updateComplete

		expect(pageHeadingChange).toHaveBeenCalledOnceWith('Sign in')
	})

	it('should only be displayed while open', async () => {
		fixture.component.open = true
		await fixture.updateComplete

		expect(fixture.component.style.display).toBe('block')

		fixture.component.open = false
		await fixture.updateComplete

		expect(fixture.component.style.display).toBe('none')
	})

	it('should expose the first element slotted into the primaryAction slot', () => {
		expect(fixture.component.primaryActionElement).toBe(primaryButton())
	})

	it('should invoke handleAction with the primary key when the primary action is clicked', () => {
		const handleAction = jasmine.createSpy('handleAction')
		fixture.component.handleAction = handleAction

		primaryButton().click()

		expect(handleAction).toHaveBeenCalledOnceWith(DialogActionKey.Primary)
	})

	it('should reflect executingAction as the loading state of a slotted loading button', async () => {
		fixture.component.executingAction = DialogActionKey.Primary
		await fixture.updateComplete

		expect(primaryButton().loading).toBeTrue()

		fixture.component.executingAction = undefined
		await fixture.updateComplete

		expect(primaryButton().loading).toBeFalse()
	})

	it('should keep the guarded dialog contract flags', () => {
		expect(fixture.component.preventCancellationOnEscape).toBeTrue()
		expect(fixture.component.primaryOnEnter).toBeTrue()
	})

	it('should render its own top layer so notifications surface above the backdrop', () => {
		expect(fixture.component.topLayerElement).toBeInstanceOf(ApplicationTopLayer)
		expect(fixture.component.renderRoot.querySelector('[part=backdrop]')).not.toBeNull()
	})
})