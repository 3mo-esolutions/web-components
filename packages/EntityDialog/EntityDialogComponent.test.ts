import { component, html } from '@a11d/lit'
import { DialogActionKey, NotificationComponent } from '@a11d/lit-application'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FetchableDialogComponentParameters } from '@3mo/fetchable-dialog'
import { EntityDialogComponent } from './index.js'

class Entity { }
const entity = new Entity
const fetchSpy = jasmine.createSpy().and.returnValue(Promise.resolve(entity))
const saveSpy = jasmine.createSpy()
const deleteSpy = jasmine.createSpy()

@component('mo-dialog-entity-test')
class DialogTest extends EntityDialogComponent<Entity, FetchableDialogComponentParameters & { readonly parentId?: number }> {
	protected entity = entity
	protected fetch = fetchSpy
	protected save = saveSpy
	protected delete = deleteSpy

	protected override get template() {
		return html`
			<mo-entity-dialog></mo-entity-dialog>
		`
	}
}

describe('EntityDialogComponent', () => {
	let entityId: number | undefined
	const fixture = new ComponentTestFixture(() => new DialogTest({ id: entityId }))

	beforeEach(() => {
		deleteSpy.calls.reset()
		fetchSpy.calls.reset()
		saveSpy.calls.reset()
	})

	afterEach(() => new Promise(resolve => setTimeout(resolve, 50)))

	const expectHeadingToBe = async (heading: string) => {
		await fixture.component.fetcherController.taskComplete
		expect(fixture.component.dialogElement['dialogHeading'].toString()).toBe(heading)
	}

	it('should not automatically set the header if it is already set', async () => {
		fixture.component.dialogElement.heading = 'Custom Heading'
		await fixture.updateComplete
		expectHeadingToBe('Custom Heading')
	})

	describe('in creation mode', () => {
		beforeAll(() => entityId = undefined)

		it('should not try to fetch entity when no id is passed in parameters', () => {
			expect(fetchSpy).not.toHaveBeenCalled()
		})

		it('should not delete entity when secondary-button is clicked', () => {
			fixture.component.secondaryActionElement?.click()
			expect(deleteSpy).not.toHaveBeenCalled()
		})

		it('should automatically set the header using entity\'s toString()', async () => {
			await expectHeadingToBe('Create Entity')

			spyOn(entity as any, 'toString').and.returnValue('Foo "Bar"')
			await expectHeadingToBe('Create Foo "Bar"')
		})
	})

	describe('in edit mode', () => {
		beforeAll(() => entityId = 10)

		it('should save entity when primary-button is clicked', () => {
			fixture.component.primaryActionElement?.click()
			expect(saveSpy).toHaveBeenCalledOnceWith(entity)
		})

		it('should delete entity when secondary-button is clicked', () => {
			fixture.component.secondaryActionElement?.click()
			expect(deleteSpy).toHaveBeenCalledWith(entity)
		})

		it('should automatically set the header according to the entity label', async () => {
			await expectHeadingToBe('Edit Entity')

			spyOn(entity as any, 'toString').and.returnValue('Foo "Bar"')
			await expectHeadingToBe('Edit Foo "Bar"')
		})
	})

	describe('the success notification', () => {
		const fixture = new ComponentTestFixture(() => new DialogTest({ id: 10, parentId: 99 }))

		afterEach(() => new Promise(resolve => setTimeout(resolve, 50)))

		const notifySuccessAndGetOpenAction = () => {
			const notifySuccessSpy = spyOn(NotificationComponent, 'notifySuccess')
			const confirmSpy = spyOn(DialogTest.prototype, 'confirm')
			fixture.component['notifySuccess']({ id: 42 } as unknown as Entity)
			const [, action] = notifySuccessSpy.calls.mostRecent().args as unknown as [string, { handleClick: () => PromiseLike<void> }]
			return { confirmSpy, open: action.handleClick }
		}

		it('should re-open the dialog with all parameters it was opened with', async () => {
			const { confirmSpy, open } = notifySuccessAndGetOpenAction()

			await open()

			const reopenedDialog = confirmSpy.calls.mostRecent().object as DialogTest
			expect(reopenedDialog.parameters).toEqual({ id: 42, parentId: 99 })
		})

		it('should invoke the confirmationHandler and pass it on, so the opener also refetches for re-opened dialogs', async () => {
			const confirmationHandler = jasmine.createSpy()
			fixture.component[EntityDialogComponent.confirmationHandler] = confirmationHandler
			const { confirmSpy, open } = notifySuccessAndGetOpenAction()

			await open()

			expect(confirmationHandler).toHaveBeenCalledTimes(1)
			const reopenedDialog = confirmSpy.calls.mostRecent().object as DialogTest
			expect(reopenedDialog[EntityDialogComponent.confirmationHandler]).toBe(confirmationHandler)
		})

		it('should not notify success when the dialog is cancelled', async () => {
			const notifySuccessSpy = spyOn(NotificationComponent, 'notifySuccess')
			const confirmation = fixture.component.confirm()

			await fixture.component['handleAction'](DialogActionKey.Cancellation)

			await expectAsync(confirmation).toBeRejected()
			expect(notifySuccessSpy).not.toHaveBeenCalled()
		})
	})

	describe('Ctrl+S shortcut', () => {
		const pressCtrlS = async () => {
			window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', ctrlKey: true }))
			await new Promise(resolve => setTimeout(resolve))
		}

		it('should trigger the primary action on Ctrl/Cmd+S', async () => {
			await pressCtrlS()

			expect(saveSpy).toHaveBeenCalledOnceWith(entity)
		})

		it('should not trigger the primary action when preventPrimaryOnCtrlS is set', async () => {
			fixture.component.dialogElement.preventPrimaryOnCtrlS = true
			await fixture.updateComplete

			await pressCtrlS()

			expect(saveSpy).not.toHaveBeenCalled()
		})
	})
})