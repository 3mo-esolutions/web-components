import { DialogActionKey, NotificationComponent } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { DialogMode } from './DialogMode.js'
import { ModdableDataGridMode } from './ModdableDataGridMode.js'
import { type ModdableDataGrid } from './ModdableDataGrid.js'
import './index.js'
import '@3mo/text-fields'
import '@3mo/checkbox'

type Parameters = { keyword?: string }

describe('DialogMode', () => {
	beforeEach(() => Localizer.languages.current = 'en')

	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	const createDataGridStub = () => {
		const modesController = {
			save: jasmine.createSpy('save').and.callFake((mode: ModdableDataGridMode<unknown, Parameters>) => Promise.resolve(mode)),
			delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
		}
		const dataGrid = {
			get currentMode() {
				return new ModdableDataGridMode<unknown, Parameters>({ parameters: { keyword: 'current' } })
			},
			modesController,
		} as unknown as ModdableDataGrid<unknown, Parameters>
		return { dataGrid, modesController }
	}

	const dialogs = new Array<DialogMode<unknown, Parameters>>()

	const closeDialogs = async () => {
		await new Promise(resolve => setTimeout(resolve, 60))
		dialogs.splice(0).forEach(dialog => dialog.remove())
	}

	afterEach(closeDialogs)

	const open = async (dialog: DialogMode<unknown, Parameters>) => {
		dialogs.push(dialog)
		const confirmation = dialog.confirm()
		await waitUntil(() => dialog.isConnected)
		await dialog.updateComplete
		return { confirmation }
	}

	it('should refuse to save without a name', async () => {
		const { dataGrid, modesController } = createDataGridStub()
		const dialog = new DialogMode<unknown, Parameters>({ dataGrid })
		const notifyErrorSpy = spyOn(NotificationComponent, 'notifyError')
		await open(dialog)

		await expectAsync(dialog['handleAction'](DialogActionKey.Primary)).toBeRejectedWithError('Please enter a valid name!')

		expect(modesController.save).not.toHaveBeenCalled()
		expect(notifyErrorSpy).toHaveBeenCalledOnceWith('Please enter a valid name!')
		expect(dialog.isConnected).toBeTrue()
	})

	it('should save the grid\'s current state merged with the edited fields and resolve with the saved mode', async () => {
		const { dataGrid, modesController } = createDataGridStub()
		const dialog = new DialogMode<unknown, Parameters>({ dataGrid })
		const { confirmation } = await open(dialog)

		dialog.mode = dialog.mode.with({ name: 'Edited' })
		await dialog.updateComplete
		await dialog['handleAction'](DialogActionKey.Primary)
		const saved = await confirmation

		expect(saved!.name).toBe('Edited')
		expect(saved!.parameters).toEqual({ keyword: 'current' })
		expect(modesController.save).toHaveBeenCalledOnceWith(saved!)
		expect(dialog.isConnected).toBeFalse()
	})

	it('should offer the archive checkbox and the delete action only for an existing mode', async () => {
		const { dataGrid } = createDataGridStub()
		const created = new DialogMode<unknown, Parameters>({ dataGrid })
		const edited = new DialogMode<unknown, Parameters>({
			dataGrid,
			mode: new ModdableDataGridMode<unknown, Parameters>({ id: '1', name: 'Existing', parameters: {} }),
		})

		await open(created)

		expect(created.renderRoot.querySelector('mo-checkbox')).toBeNull()
		expect(created.secondaryActionElement).toBeFalsy()

		await closeDialogs()
		await open(edited)

		expect(edited.renderRoot.querySelector('mo-checkbox')).not.toBeNull()
		expect(edited.secondaryActionElement?.textContent?.trim()).toBe('Delete')
	})

	it('should delete the mode via the secondary action and resolve with undefined', async () => {
		const { dataGrid, modesController } = createDataGridStub()
		const mode = new ModdableDataGridMode<unknown, Parameters>({ id: '1', name: 'Existing', parameters: {} })
		const dialog = new DialogMode<unknown, Parameters>({ dataGrid, mode })
		const { confirmation } = await open(dialog)

		dialog.secondaryActionElement!.click()

		await expectAsync(confirmation).toBeResolvedTo(undefined)
		expect(modesController.delete).toHaveBeenCalledOnceWith(mode)
	})
})