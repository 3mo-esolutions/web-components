import { component, html, type HTMLTemplateResult } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Application, DialogActionKey, DialogCancelledError, DialogComponent, type Notification, NotificationComponent } from '@a11d/lit-application'
import { type MdDialog } from '@material/web/dialog/dialog.js'
import { Dialog, DialogSize } from './Dialog.js'
import './index.js'

@NotificationComponent.defaultComponent()
@component('test-fake-notification')
export class FakeNotification extends NotificationComponent {
	notification!: Notification
	show(): Promise<void> {
		return Promise.resolve()
	}
}

@component('test-confirmation-dialog')
class TestConfirmationDialog extends DialogComponent<void, string> {
	action: () => string | Promise<string> = () => 'primary result'

	protected override get template(): HTMLTemplateResult {
		return html`
			<mo-dialog heading='Test Dialog'>
				<span slot='primaryAction'>Primary</span>
				Content
			</mo-dialog>
		`
	}

	protected override primaryAction() {
		return this.action()
	}
}

class TestPrimaryActionElement extends HTMLElement { }
customElements.define('test-dialog-primary-action', TestPrimaryActionElement)

class TestSecondaryActionElement extends HTMLElement { }
customElements.define('test-dialog-secondary-action', TestSecondaryActionElement)

HTMLDialogElement.prototype.showModal = () => undefined

describe('Dialog', () => {
	describe('rendering', () => {
		const fixture = new ComponentTestFixture<Dialog>('mo-dialog')

		it('should render the heading text in the header', async () => {
			fixture.component.heading = 'Delete invoice'
			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('[part=heading]')?.textContent).toBe('Delete invoice')
		})

		it('should dispatch pageHeadingChange when the heading changes', async () => {
			const headings = new Array<string>()
			fixture.component.addEventListener('pageHeadingChange', (e: Event) => headings.push((e as CustomEvent<string>).detail))

			fixture.component.heading = 'Delete invoice'
			await fixture.updateComplete

			expect(headings).toEqual(['Delete invoice'])
		})

		for (const size of Object.values(DialogSize)) {
			it(`should reflect the size attribute used for size-based styling ("${size}")`, async () => {
				fixture.component.size = size
				await fixture.updateComplete

				expect(fixture.component.getAttribute('size')).toBe(size)
				expect(fixture.component.renderRoot.querySelector('md-dialog')?.getAttribute('data-size')).toBe(size)
			})
		}

		it('should re-dispatch the scroll event on scroll', () => {
			let scrollEvent: Event | undefined
			fixture.component.addEventListener('scroll', (e: Event) => scrollEvent = e)

			fixture.component
				.renderRoot.querySelector('md-dialog')
				?.renderRoot.querySelector('.scroller')
				?.dispatchEvent(new Event('scroll'))

			expect(scrollEvent).toBeDefined()
			expect(scrollEvent?.type).toBe('scroll')
		})
	})

	describe('footer', () => {
		const fixture = new ComponentTestFixture<Dialog>('mo-dialog')

		it('should not render the footer when no actions and no footer content are present', () => {
			expect(fixture.component.renderRoot.querySelector('[part=footer]')).toBeNull()
		})

		it('should render a default primary loading-button labeled with primaryButtonText', async () => {
			fixture.component.primaryButtonText = 'Save'
			await fixture.updateComplete

			const button = fixture.component.renderRoot.querySelector('[part=footer] slot[name=primaryAction] > mo-loading-button')
			expect(button?.textContent?.trim()).toBe('Save')
		})

		it('should render a default secondary loading-button labeled with secondaryButtonText', async () => {
			fixture.component.secondaryButtonText = 'Discard'
			await fixture.updateComplete

			const button = fixture.component.renderRoot.querySelector('[part=footer] slot[name=secondaryAction] > mo-loading-button')
			expect(button?.textContent?.trim()).toBe('Discard')
		})

		describe('with footer content', () => {
			const footerFixture = new ComponentTestFixture<Dialog>(html`
				<mo-dialog>
					<span slot='footer' id='footer-content'>Footer</span>
				</mo-dialog>
			`)

			it('should render the footer when content is slotted into the footer slot', () => {
				const footerSlot = footerFixture.component.renderRoot.querySelector<HTMLSlotElement>('[part=footer] slot[name=footer]')
				expect(footerSlot?.assignedElements().map(element => element.id)).toEqual(['footer-content'])
			})
		})
	})

	describe('action elements', () => {
		const fixture = new ComponentTestFixture<Dialog>(html`
			<mo-dialog>
				<span slot='primaryAction' id='primary'>Primary</span>
				<span slot='secondaryAction' id='secondary'>Secondary</span>
			</mo-dialog>
		`)

		it('should resolve primaryActionElement to the element slotted into primaryAction', () => {
			expect(fixture.component.primaryActionElement).toBe(fixture.component.querySelector<HTMLElement>('#primary')!)
		})

		it('should resolve secondaryActionElement to the element slotted into secondaryAction', () => {
			expect(fixture.component.secondaryActionElement).toBe(fixture.component.querySelector<HTMLElement>('#secondary')!)
		})

		it('should resolve cancellationActionElement to the close icon-button', () => {
			expect(fixture.component.cancellationActionElement?.localName).toBe('mo-icon-button')
			expect(fixture.component.cancellationActionElement?.getAttribute('icon')).toBe('close')
		})

		describe('without slotted action elements', () => {
			const defaultFixture = new ComponentTestFixture<Dialog>('mo-dialog')

			it('should resolve primaryActionElement to the default button generated from primaryButtonText', async () => {
				defaultFixture.component.primaryButtonText = 'Save'
				await defaultFixture.updateComplete

				expect(defaultFixture.component.primaryActionElement?.localName).toBe('mo-loading-button')
				expect(defaultFixture.component.primaryActionElement?.textContent?.trim()).toBe('Save')
			})
		})
	})

	describe('action handling', () => {
		let handleAction: jasmine.Spy

		const fixture = new ComponentTestFixture<Dialog>(html`
			<mo-dialog>
				<span slot='primaryAction' id='primary'>Primary</span>
				<span slot='secondaryAction' id='secondary'>Secondary</span>
			</mo-dialog>
		`)

		beforeEach(() => {
			handleAction = jasmine.createSpy('handleAction')
			fixture.component.handleAction = handleAction
		})

		it('should call handleAction with Primary when a click occurs in the primaryAction slot', () => {
			fixture.component.querySelector<HTMLElement>('#primary')!.click()

			expect(handleAction).toHaveBeenCalledOnceWith(DialogActionKey.Primary)
		})

		it('should call handleAction with Secondary when a click occurs in the secondaryAction slot', () => {
			fixture.component.querySelector<HTMLElement>('#secondary')!.click()

			expect(handleAction).toHaveBeenCalledOnceWith(DialogActionKey.Secondary)
		})

		it('should call handleAction with Cancellation when the close icon-button is clicked', () => {
			fixture.component.cancellationActionElement!.click()

			expect(handleAction).toHaveBeenCalledOnceWith(DialogActionKey.Cancellation)
		})

		describe('executing action adapters', () => {
			let primaryAdapter: jasmine.Spy
			let secondaryAdapter: jasmine.Spy

			const adapterFixture = new ComponentTestFixture<Dialog>(html`
				<mo-dialog>
					<test-dialog-primary-action slot='primaryAction'></test-dialog-primary-action>
					<test-dialog-secondary-action slot='secondaryAction'></test-dialog-secondary-action>
				</mo-dialog>
			`)

			beforeEach(() => {
				primaryAdapter = jasmine.createSpy('primaryAdapter')
				secondaryAdapter = jasmine.createSpy('secondaryAdapter')
				Dialog.executingActionAdaptersByComponent.set(TestPrimaryActionElement, primaryAdapter)
				Dialog.executingActionAdaptersByComponent.set(TestSecondaryActionElement, secondaryAdapter)
			})

			afterEach(() => {
				Dialog.executingActionAdaptersByComponent.delete(TestPrimaryActionElement)
				Dialog.executingActionAdaptersByComponent.delete(TestSecondaryActionElement)
			})

			it('should notify the adapter registered for the primary action element\'s constructor when executingAction is set to Primary and again when cleared', async () => {
				const primaryElement = adapterFixture.component.querySelector('test-dialog-primary-action')

				adapterFixture.component.executingAction = DialogActionKey.Primary
				await adapterFixture.updateComplete

				expect(primaryAdapter).toHaveBeenCalledOnceWith(primaryElement, true)

				adapterFixture.component.executingAction = undefined
				await adapterFixture.updateComplete

				expect(primaryAdapter).toHaveBeenCalledWith(primaryElement, false)
			})

			it('should notify only the executing action\'s adapter, leaving the other action element untouched', async () => {
				const primaryElement = adapterFixture.component.querySelector('test-dialog-primary-action')
				const secondaryElement = adapterFixture.component.querySelector('test-dialog-secondary-action')

				adapterFixture.component.executingAction = DialogActionKey.Primary
				await adapterFixture.updateComplete

				expect(primaryAdapter).toHaveBeenCalledOnceWith(primaryElement, true)
				expect(secondaryAdapter).toHaveBeenCalledOnceWith(secondaryElement, false)
			})
		})
	})

	describe('blocking', () => {
		const fixture = new ComponentTestFixture<Dialog>(html`<mo-dialog blocking heading='Blocking'></mo-dialog>`)

		it('should not render the close icon-button', () => {
			expect(fixture.component.renderRoot.querySelector('mo-icon-button[icon=close]')).toBeNull()
			expect(fixture.component.cancellationActionElement).toBeUndefined()
		})

		it('should report preventCancellationOnEscape so that Escape cannot cancel the dialog', async () => {
			expect(fixture.component.preventCancellationOnEscape).toBe(true)

			fixture.component.blocking = false
			await fixture.updateComplete

			expect(fixture.component.preventCancellationOnEscape).toBe(false)
		})
	})

	describe('poppability', () => {
		const fixture = new ComponentTestFixture<Dialog>('mo-dialog')

		const popButton = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-icon-button[icon=launch]')

		let disablePoppability: boolean

		beforeEach(() => disablePoppability = Dialog.disablePoppability)

		afterEach(() => Dialog.disablePoppability = disablePoppability)

		it('should not render the open-as-tab icon-button when not poppable', () => {
			expect(fixture.component.poppable).toBe(false)
			expect(popButton()).toBeNull()
		})

		it('should render the open-as-tab icon-button when poppable', async () => {
			fixture.component.poppable = true
			await fixture.updateComplete

			expect(popButton()).not.toBeNull()
		})

		it('should not render the open-as-tab icon-button when Dialog.disablePoppability is set even while poppable', async () => {
			Dialog.disablePoppability = true

			fixture.component.poppable = true
			await fixture.updateComplete

			expect(popButton()).toBeNull()
		})

		it('should dispatch requestPopup when the open-as-tab icon-button is clicked', async () => {
			fixture.component.poppable = true
			await fixture.updateComplete
			let dispatched = false
			fixture.component.addEventListener('requestPopup', () => dispatched = true)

			popButton()!.click()

			expect(dispatched).toBe(true)
		})
	})

	describe('open', () => {
		const fixture = new ComponentTestFixture<Dialog>(html`
			<mo-dialog>
				<input autofocus>
			</mo-dialog>
		`)

		const mdDialog = () => fixture.component.renderRoot.querySelector('md-dialog') as MdDialog

		it('should forward open to the underlying md-dialog', async () => {
			expect(mdDialog().open).toBe(false)

			fixture.component.open = true
			await fixture.updateComplete

			expect(mdDialog().open).toBe(true)
		})

		it('should focus the first [autofocus] element when opened', async () => {
			const input = fixture.component.querySelector('input')!
			const focus = spyOn(input, 'focus')

			fixture.component.open = true
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve, 100))

			expect(focus).toHaveBeenCalled()
		})

		it('should prevent the native cancel event so that cancellation stays routed through the application', () => {
			const cancelEvent = new Event('cancel', { cancelable: true })

			mdDialog().dispatchEvent(cancelEvent)

			expect(cancelEvent.defaultPrevented).toBe(true)
		})
	})

	describe('confirmation lifecycle', () => {
		const fixture = new ComponentTestFixture(() => new TestConfirmationDialog(undefined))

		const untilTopLayerIsOwned = async () => {
			for (let attempt = 0; attempt < 100 && Application.topLayer !== fixture.component.dialogElement.topLayerElement; ++attempt) {
				await new Promise(resolve => setTimeout(resolve, 10))
			}
		}

		it('should resolve confirm() with the primary action\'s result when the primary action element is clicked', async () => {
			const confirmationPromise = fixture.component.confirm()

			fixture.component.primaryActionElement!.click()

			await expectAsync(confirmationPromise).toBeResolvedTo('primary result')
		})

		it('should reject confirm() with DialogCancelledError when the cancellation action is triggered', async () => {
			const confirmationPromise = fixture.component.confirm()

			fixture.component.cancellationActionElement!.click()

			await expectAsync(confirmationPromise).toBeRejectedWithError(DialogCancelledError)
		})

		it('should keep the dialog open after the primary action when manualClose is set', async () => {
			fixture.component.dialogElement.manualClose = true
			let settled = false
			fixture.component.confirm().then(() => settled = true, () => settled = true)

			fixture.component.primaryActionElement!.click()
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(settled).toBe(false)
			expect(fixture.component.dialogElement.open).toBe(true)
			expect(fixture.component.isConnected).toBe(true)
		})

		it('should close on cancellation even when manualClose is set', async () => {
			fixture.component.dialogElement.manualClose = true
			const confirmationPromise = fixture.component.confirm()
			const dialogElement = fixture.component.dialogElement

			fixture.component.cancellationActionElement!.click()

			await expectAsync(confirmationPromise).toBeRejectedWithError(DialogCancelledError)
			expect(dialogElement.open).toBe(false)
			expect(fixture.component.isConnected).toBe(false)
		})

		it('should execute the primary action when Enter is pressed while primaryOnEnter is set', async () => {
			fixture.component.dialogElement.primaryOnEnter = true
			const confirmationPromise = fixture.component.confirm()
			await untilTopLayerIsOwned()

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

			await expectAsync(confirmationPromise).toBeResolvedTo('primary result')
		})

		it('should not execute the primary action on Enter when primaryOnEnter is not set', async () => {
			const action = jasmine.createSpy('action').and.returnValue('primary result')
			fixture.component.action = action
			fixture.component.confirm().catch(() => void 0)
			await untilTopLayerIsOwned()

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(action).not.toHaveBeenCalled()
			expect(fixture.component.dialogElement.open).toBe(true)
		})

		it('should cancel when Escape is pressed', async () => {
			const confirmationPromise = fixture.component.confirm()
			await untilTopLayerIsOwned()

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

			await expectAsync(confirmationPromise).toBeRejectedWithError(DialogCancelledError)
		})

		it('should not cancel on Escape when blocking', async () => {
			(fixture.component.dialogElement as Dialog).blocking = true
			let settled = false
			fixture.component.confirm().then(() => settled = true, () => settled = true)
			await untilTopLayerIsOwned()

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(settled).toBe(false)
			expect(fixture.component.isConnected).toBe(true)
			expect(fixture.component.dialogElement.open).toBe(true)
		})

		it('should set executingAction while an async action is pending and clear it once it settles', async () => {
			let resolveAction!: (result: string) => void
			fixture.component.action = () => new Promise<string>(resolve => resolveAction = resolve)
			const confirmationPromise = fixture.component.confirm()

			fixture.component.primaryActionElement!.click()
			await new Promise(resolve => setTimeout(resolve))

			expect(fixture.component.dialogElement.executingAction).toBe(DialogActionKey.Primary)

			resolveAction('async result')

			await expectAsync(confirmationPromise).toBeResolvedTo('async result')
			expect(fixture.component.dialogElement.executingAction).toBeUndefined()
		})
	})
})