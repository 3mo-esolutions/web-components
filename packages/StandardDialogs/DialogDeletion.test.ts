import { ComponentTestFixture } from '@a11d/lit-testing'
import { DialogCancelledError, NotificationComponent } from '@a11d/lit-application'
import { DialogDeletion } from './DialogDeletion.js'
import './index.js'

describe('DialogDeletion', () => {
	/**
	 * The confirmation question is the light DOM of the dialog element without the slotted action elements.
	 * Lit's part markers are comment nodes whose textContent is the marker itself, so they have to be skipped.
	 */
	const contentText = (dialogElement: Element) => [...dialogElement.childNodes]
		.filter(node => node instanceof Text || (node instanceof Element && !node.slot))
		.map(node => node.textContent ?? '')
		.join('')
		.replace(/\s+/g, ' ')
		.trim()

	let deletionConfirmation: boolean

	beforeEach(() => {
		deletionConfirmation = DialogDeletion.deletionConfirmation.value
		DialogDeletion.deletionConfirmation.value = true
	})

	afterEach(() => DialogDeletion.deletionConfirmation.value = deletionConfirmation)

	describe('defaults', () => {
		const fixture = new ComponentTestFixture(() => new DialogDeletion({ label: 'Invoice 42' }))

		/**
		 * Opening a dialog is deferred by md-dialog, whose showModal throws - unhandled, and thereby
		 * failing whichever spec happens to run at the time - on an element the fixture has already
		 * removed. Registered after the fixture, so it runs before the fixture's removal.
		 */
		afterEach(() => new Promise(resolve => setTimeout(resolve, 50)))

		it('should default the heading to the localized "Confirm Deletion"', () => {
			expect(fixture.component.dialogElement.heading).toBe('Confirm Deletion')
		})

		it('should default the primary button text to "Delete"', () => {
			expect(fixture.component.primaryActionElement?.textContent?.trim()).toBe('Delete')
		})

		it('should highlight the label inside the confirmation question', () => {
			expect(fixture.component.dialogElement.querySelector('#label')?.textContent).toBe('Invoice 42')
			expect(contentText(fixture.component.dialogElement)).toBe('Are you sure you want to delete Invoice 42?')
		})
	})

	describe('without a label', () => {
		const labellessFixture = new ComponentTestFixture(() => new DialogDeletion({}))

		afterEach(() => new Promise(resolve => setTimeout(resolve, 50)))

		it('should render the default confirmation question when no content is given', () => {
			expect(labellessFixture.component.dialogElement.querySelector('#label')).toBeNull()
			expect(contentText(labellessFixture.component.dialogElement)).toBe('Are you sure you want to delete this?')
		})
	})

	describe('confirmation', () => {
		let deletionAction: jasmine.Spy

		beforeEach(() => deletionAction = jasmine.createSpy('deletionAction'))

		const fixture = new ComponentTestFixture(() => new DialogDeletion({ label: 'Invoice 42', deletionAction }))

		afterEach(() => new Promise(resolve => setTimeout(resolve, 50)))

		it('should call deletionAction and resolve when the primary button is clicked', async () => {
			const confirmationPromise = fixture.component.confirm()

			fixture.component.primaryActionElement?.click()

			await expectAsync(confirmationPromise).toBeResolved()
			expect(deletionAction).toHaveBeenCalledTimes(1)
		})

		it('should reject with DialogCancelledError when cancelled without deleting', async () => {
			const confirmationPromise = fixture.component.confirm()

			fixture.component.cancellationActionElement?.click()

			await expectAsync(confirmationPromise).toBeRejectedWithError(DialogCancelledError)
			expect(deletionAction).not.toHaveBeenCalled()
		})
	})

	describe('deletion-confirmation setting', () => {
		let deletionAction: jasmine.Spy

		beforeEach(() => deletionAction = jasmine.createSpy('deletionAction'))

		it('should show the dialog when the setting is on', async () => {
			DialogDeletion.deletionConfirmation.value = true
			const dialog = new DialogDeletion({ label: 'Invoice 42', deletionAction })

			dialog.confirm().catch(() => void 0)
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(dialog.isConnected).toBe(true)
			expect(dialog.dialogElement.open).toBe(true)
			expect(deletionAction).not.toHaveBeenCalled()

			dialog.remove()
		})

		it('should invoke deletionAction immediately without showing the dialog when the setting is off', async () => {
			DialogDeletion.deletionConfirmation.value = false
			const dialog = new DialogDeletion({ label: 'Invoice 42', deletionAction })

			await expectAsync(dialog.confirm()).toBeResolved()

			expect(deletionAction).toHaveBeenCalledTimes(1)
			expect(dialog.isConnected).toBe(false)
		})

		it('should notify and rethrow when deletionAction fails while the dialog is skipped', async () => {
			DialogDeletion.deletionConfirmation.value = false
			const notifyError = spyOn(NotificationComponent, 'notifyError').and.resolveTo()
			const error = new Error('Deletion failed')
			const dialog = new DialogDeletion({ label: 'Invoice 42', deletionAction: () => { throw error } })

			await expectAsync(dialog.confirm()).toBeRejectedWith(error)

			expect(notifyError).toHaveBeenCalledOnceWith({ message: 'Deletion failed', actions: [] })
		})
	})
})