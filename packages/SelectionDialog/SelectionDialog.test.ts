import { html, render } from '@a11d/lit'
import { DialogCancelledError } from '@a11d/lit-application'
import { label } from '@a11d/metadata'
import '@3mo/fetchable-data-grid'
import { SelectionDialog, type SelectionDialogParameters } from './index.js'

type FetchableDataGrid = HTMLElementTagNameMap['mo-fetchable-data-grid']

@label('Person')
class Person {
	constructor(readonly id: number, readonly name: string) { }
}

const people = [new Person(1, 'Ada'), new Person(2, 'Bea'), new Person(3, 'Cy')]

describe('SelectionDialog', () => {
	const until = async (condition: () => boolean) => {
		for (let attempt = 0; attempt < 300 && !condition(); ++attempt) {
			await new Promise(resolve => setTimeout(resolve, 10))
		}
		expect(condition()).toBe(true)
	}

	const open = async <TMultipleSelection extends boolean = false>(parameters?: Partial<SelectionDialogParameters<Person, TMultipleSelection>>) => {
		const dialog = new SelectionDialog<Person, TMultipleSelection>({
			data: Person,
			dataGridTemplate: html`
				<mo-fetchable-data-grid .fetch=${() => people}>
					<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				</mo-fetchable-data-grid>
			`,
			...parameters,
		})
		const confirmation = dialog.confirm()
		confirmation.catch(() => { })
		const dataGrid = await new Promise<FetchableDataGrid>(resolve => {
			const find = () => {
				const grid = dialog.renderRoot?.querySelector('mo-fetchable-data-grid') as FetchableDataGrid | null
				return grid?.data.length ? resolve(grid) : setTimeout(find, 10)
			}
			find()
		})
		const primaryButton = () => dialog.renderRoot.querySelector('mo-loading-button[slot=primaryAction]') as HTMLElement & { disabled: boolean }
		return { dialog, confirmation, dataGrid, primaryButton }
	}

	const cancel = async (dialog: SelectionDialog<Person, boolean>, confirmation: Promise<unknown>) => {
		dialog.cancellationActionElement?.click()
		await expect(confirmation).rejects.toThrow(DialogCancelledError)
	}

	it('should head the dialog with the label of the data type', async () => {
		const { dialog, confirmation } = await open()

		expect(dialog.dialogElement.heading).toBe('Select Person')

		await cancel(dialog, confirmation)
	})

	it('should prefer an explicit heading and primary button text', async () => {
		const { dialog, confirmation, primaryButton } = await open({ heading: 'Pick someone', primaryButtonText: 'Pick' })

		expect(dialog.dialogElement.heading).toBe('Pick someone')
		expect(primaryButton().textContent!.trim()).toBe('Pick')

		await cancel(dialog, confirmation)
	})

	it('should disable the primary button until an entry is selected', async () => {
		const { dialog, confirmation, dataGrid, primaryButton } = await open()
		await dialog.updateComplete
		expect(primaryButton().disabled).toBe(true)

		dataGrid.select([people[1]!])
		await until(() => !primaryButton().disabled)

		await cancel(dialog, confirmation)
	})

	it('should confirm with the selected entry', async () => {
		const { confirmation, dataGrid, primaryButton } = await open()

		dataGrid.select([people[1]!])
		await until(() => !primaryButton().disabled)
		primaryButton().click()

		await expect(confirmation).resolves.toBe(people[1])
	})

	it('should confirm with all selected entries when selecting multiple', async () => {
		const { confirmation, dataGrid, primaryButton } = await open<true>({ multipleSelection: true })

		dataGrid.select([people[0]!, people[2]!])
		await until(() => !primaryButton().disabled)
		primaryButton().click()

		await expect(confirmation).resolves.toEqual([people[0], people[2]])
	})

	it('should confirm with the rows a context menu was opened for, even when they are not selected', async () => {
		const { confirmation, dataGrid } = await open()
		const container = document.createElement('div')
		document.body.appendChild(container)

		render(dataGrid.getRowContextMenuTemplate!([people[2]!]), container)
		;(container.querySelector('mo-data-grid-primary-context-menu-item') as HTMLElement).click()

		await expect(confirmation).resolves.toBe(people[2])
		container.remove()
	})

	it('should keep the context menu of the data grid below its own item', async () => {
		const dialog = new SelectionDialog<Person>({
			data: Person,
			dataGridTemplate: html`
				<mo-fetchable-data-grid .fetch=${() => people} .getRowContextMenuTemplate=${() => html`<mo-context-menu-item id='own'>Own</mo-context-menu-item>`}>
					<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				</mo-fetchable-data-grid>
			`,
		})
		const confirmation = dialog.confirm()
		confirmation.catch(() => { })
		await until(() => !!dialog.renderRoot?.querySelector('mo-fetchable-data-grid'))
		const dataGrid = dialog.renderRoot.querySelector('mo-fetchable-data-grid') as FetchableDataGrid
		await dialog.updateComplete
		const container = document.createElement('div')

		render(dataGrid.getRowContextMenuTemplate!([people[0]!]), container)

		expect([...container.children].map(child => child.id || child.localName)).toEqual(['mo-data-grid-primary-context-menu-item', 'mo-line', 'own'])
		await cancel(dialog, confirmation)
	})

	it('should select from a plain data grid', async () => {
		const dialog = new SelectionDialog<Person>({
			data: Person,
			dataGridTemplate: html`
				<mo-data-grid .data=${people}>
					<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				</mo-data-grid>
			`,
		})
		const confirmation = dialog.confirm()
		await until(() => !!dialog.renderRoot?.querySelector('mo-data-grid'))
		await dialog.updateComplete
		const primaryButton = () => dialog.renderRoot.querySelector('mo-loading-button[slot=primaryAction]') as HTMLElement & { disabled: boolean }

		dialog.renderRoot.querySelector('mo-data-grid')!.select([people[0]!])
		await until(() => !primaryButton().disabled)
		primaryButton().click()

		await expect(confirmation).resolves.toBe(people[0])
	})
})
