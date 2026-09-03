import { html } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { GenericEntityDialog } from './GenericEntityDialog.js'
import './index.js'

type Item = { id: number, name: string }

describe('GenericEntityDialog', () => {
	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	const fetch = (id: number | string) => ({ id: Number(id), name: `Item ${id}` }) as Item

	const dialogs = new Array<GenericEntityDialog<Item>>()

	const mount = async (dialog: GenericEntityDialog<Item>) => {
		dialogs.push(dialog)
		document.body.appendChild(dialog)
		await dialog.updateComplete
		return dialog
	}

	afterEach(async () => {
		await new Promise(resolve => setTimeout(resolve, 60))
		dialogs.splice(0).forEach(dialog => dialog.remove())
	})

	it('should save via the parameterized save action and resolve with its result', async () => {
		const saved = { id: 3, name: 'Saved' }
		const save = jasmine.createSpy('save').and.returnValue(saved)
		spyOn(NotificationComponent, 'notifySuccess')
		const dialog = new GenericEntityDialog<Item>({
			entity: { id: 0, name: 'New' },
			fetch,
			save,
			content: () => html`<div id='content'></div>`,
		})
		const confirmation = dialog.confirm()
		await waitUntil(() => dialog.isConnected)
		dialogs.push(dialog)
		await dialog.updateComplete

		dialog.primaryActionElement!.click()

		await expectAsync(confirmation).toBeResolvedTo(saved)
		expect(save).toHaveBeenCalledOnceWith(dialog.entity)
	})

	it('should wire the parameterized delete action only when an id is given', async () => {
		const deleteAction = jasmine.createSpy('delete')
		const parameters = {
			entity: { id: 0, name: 'New' },
			fetch,
			save: () => undefined,
			delete: deleteAction,
			content: () => html`<div id='content'></div>`,
		}

		const created = await mount(new GenericEntityDialog<Item>(parameters))
		expect(created.dialogElement.delete).toBeUndefined()
		expect(created.secondaryActionElement).toBeUndefined()

		const edited = await mount(new GenericEntityDialog<Item>({ ...parameters, id: 3 }))
		await waitUntil(() => edited.entity?.name === 'Item 3')
		const entity = edited.entity
		expect(edited.dialogElement.delete).not.toBeUndefined()

		await edited.dialogElement.delete!()

		expect(deleteAction).toHaveBeenCalledOnceWith(entity)
	})
})