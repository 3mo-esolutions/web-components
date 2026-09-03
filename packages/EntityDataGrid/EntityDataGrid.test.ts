import { component, html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { EntityDialogComponent } from '@3mo/entity-dialog'
import { ContextMenu } from '@3mo/context-menu'
import { EntityDataGrid } from './index.js'

type Person = { id: number, name: string }

const john = { id: 1, name: 'John' }
const jane = { id: 2, name: 'Jane' }

@component('mo-entity-data-grid-test-dialog')
class TestDialog extends EntityDialogComponent<Person> {
	protected entity = john
	protected fetch = () => this.entity
	protected save = () => this.entity
	protected delete = () => undefined

	protected override get template() {
		return html`
			<mo-entity-dialog></mo-entity-dialog>
		`
	}
}

describe('EntityDataGrid', () => {
	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	let contextMenuContainer: HTMLElement | undefined
	const renderRowContextMenu = (grid: EntityDataGrid<Person>, entities: Array<Person>) => {
		contextMenuContainer?.remove()
		contextMenuContainer = document.createElement('div')
		document.body.appendChild(contextMenuContainer)
		render(grid.getRowContextMenuTemplate!(entities), contextMenuContainer)
		return contextMenuContainer
	}

	afterEach(() => {
		contextMenuContainer?.remove()
		contextMenuContainer = undefined
	})

	describe('Primary Action', () => {
		const fixture = new ComponentTestFixture<EntityDataGrid<Person>>(html`
			<mo-entity-data-grid .fetch=${() => Promise.resolve([{ id: 1, name: 'John' }])}></mo-entity-data-grid>
		`)

		const getCreateButton = () => fixture.component.renderRoot.querySelector('mo-loading-button')

		it('should not have a primary action without a "create" action', () => {
			expect(fixture.component).toBeInstanceOf(EntityDataGrid)
			expect(fixture.component.hasPrimaryAction).toBeFalse()
			expect(fixture.component.renderRoot.querySelector('#toolbar')).toBeNull()
		})

		it('should render the toolbar with the generated create button once a "create" action is set', async () => {
			fixture.component.create = () => Promise.resolve()
			await fixture.updateComplete

			expect(fixture.component.hasPrimaryAction).toBeTrue()
			expect(fixture.component.renderRoot.querySelector('#toolbar')).not.toBeNull()
			expect(getCreateButton()?.checkVisibility()).toBeTrue()
		})

		it('should hide the generated create button when "createHidden"', async () => {
			fixture.component.create = () => Promise.resolve()
			fixture.component.createHidden = true
			await fixture.updateComplete

			expect(fixture.component.hasPrimaryAction).toBeFalse()
			expect(getCreateButton()).toBeNull()
		})

		it('should keep rendering the generated create button alongside slotted primary actions', async () => {
			fixture.component.create = () => Promise.resolve()
			const slotted = document.createElement('button')
			slotted.slot = 'primary-action'
			fixture.component.appendChild(slotted)
			await fixture.updateComplete

			const slot = fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=primary-action]')
			expect(slot?.assignedElements()).toEqual([slotted])
			expect(getCreateButton()?.checkVisibility()).toBeTrue()

			slotted.remove()
		})
	})

	describe('Entity Dialogs', () => {
		const fixture = new ComponentTestFixture<EntityDataGrid<Person>>(html`
			<mo-entity-data-grid .fetch=${() => Promise.resolve([{ id: 1, name: 'John' }])}></mo-entity-data-grid>
		`)

		it('should refetch when a dialog re-opened from the success notification is confirmed', async () => {
			const dialog = { confirm: () => Promise.resolve() } as unknown as EntityDialogComponent<Person>
			const requestFetchSpy = spyOn(fixture.component, 'requestFetch')

			await fixture.component['confirmEntityDialog'](dialog)
			await dialog[EntityDialogComponent.confirmationHandler]?.()

			expect(requestFetchSpy).toHaveBeenCalledTimes(1)
		})
	})

	describe('CRUD actions', () => {
		const fixture = new ComponentTestFixture<EntityDataGrid<Person>>(html`
			<mo-entity-data-grid .fetch=${() => Promise.resolve([{ ...john }, { ...jane }])}></mo-entity-data-grid>
		`)

		let dialogParameters: Array<unknown>
		let confirmSpy: jasmine.Spy

		beforeEach(() => {
			dialogParameters = []
			confirmSpy = spyOn(TestDialog.prototype, 'confirm').and.callFake(function (this: TestDialog) {
				dialogParameters.push(this.parameters)
				return Promise.resolve(undefined)
			})
		})

		const createButton = () => fixture.component.renderRoot.querySelector<HTMLElement>('mo-loading-button')

		it('should invoke a functional create action and refetch afterwards', async () => {
			const create = jasmine.createSpy('create')
			fixture.component.create = create
			await waitUntil(() => !!createButton())
			const requestFetchSpy = spyOn(fixture.component, 'requestFetch')

			createButton()!.click()
			await waitUntil(() => requestFetchSpy.calls.any())

			expect(create).toHaveBeenCalledTimes(1)
			expect(requestFetchSpy).toHaveBeenCalledTimes(1)
		})

		it('should instantiate and confirm a dialog-class create action with empty parameters', async () => {
			fixture.component.create = TestDialog
			await fixture.updateComplete
			const requestFetchSpy = spyOn(fixture.component, 'requestFetch')

			await fixture.component.createAndRefetch()

			expect(confirmSpy).toHaveBeenCalledTimes(1)
			expect(dialogParameters).toEqual([{}])
			expect(requestFetchSpy).toHaveBeenCalledTimes(1)
		})

		it('should pass the entity id to a dialog-class edit action and refetch after it is confirmed', async () => {
			fixture.component.edit = TestDialog
			await fixture.updateComplete
			const requestFetchSpy = spyOn(fixture.component, 'requestFetch')

			await fixture.component.editAndRefetch({ ...jane })

			expect(confirmSpy).toHaveBeenCalledTimes(1)
			expect(dialogParameters).toEqual([{ id: 2 }])
			expect(requestFetchSpy).toHaveBeenCalledTimes(1)
		})

		// Disabled: Firefox timeout when awaiting lazy context menu
		xit('should wire both create and edit when createOrEdit is set', async () => {
			fixture.component.createOrEdit = TestDialog
			await waitUntil(() => !!createButton())

			expect(fixture.component.create).toBe(TestDialog)
			expect(fixture.component.edit).toBe(TestDialog)

			await fixture.component.editAndRefetch({ ...jane })

			expect(dialogParameters).toEqual([{ id: 2 }])
		})

		it('should pass all selected entities to the delete action and refetch afterwards', async () => {
			const deleteAction = jasmine.createSpy('delete')
			fixture.component.delete = deleteAction
			await fixture.updateComplete
			const requestFetchSpy = spyOn(fixture.component, 'requestFetch')
			const menu = renderRowContextMenu(fixture.component, [john, jane])

			menu.querySelector<HTMLElement>('[data-test-id=delete]')!.click()
			await waitUntil(() => requestFetchSpy.calls.any())

			expect(deleteAction).toHaveBeenCalledOnceWith(john, jane)
			expect(requestFetchSpy).toHaveBeenCalledTimes(1)
		})
	})

	describe('Row context menu', () => {
		const fixture = new ComponentTestFixture<EntityDataGrid<Person>>(html`
			<mo-entity-data-grid .fetch=${() => Promise.resolve([{ ...john }, { ...jane }])}></mo-entity-data-grid>
		`)

		const itemsOf = (entities: Array<Person>) => [...renderRowContextMenu(fixture.component, entities).querySelectorAll('[data-test-id]')]
			.map(item => item.getAttribute('data-test-id'))

		it('should offer Edit only when exactly one entity is selected', async () => {
			fixture.component.edit = () => undefined
			await fixture.updateComplete

			expect(itemsOf([john])).toEqual(['edit'])
			expect(itemsOf([john, jane])).toEqual([])
		})

		it('should not offer Edit when isEntityEditable vetoes the entity', async () => {
			fixture.component.edit = () => undefined
			fixture.component.isEntityEditable = entity => entity.id !== jane.id
			await fixture.updateComplete

			expect(itemsOf([john])).toEqual(['edit'])
			expect(itemsOf([jane])).toEqual([])
		})

		it('should not offer Delete when any of the entities is not deletable per isEntityDeletable', async () => {
			fixture.component.delete = () => undefined
			fixture.component.isEntityDeletable = entity => entity.id !== jane.id
			await fixture.updateComplete

			expect(itemsOf([john])).toEqual(['delete'])
			expect(itemsOf([john, jane])).toEqual([])
		})

		it('should offer neither Edit nor Delete without the respective action', () => {
			expect(fixture.component.edit).toBeUndefined()
			expect(fixture.component.delete).toBeUndefined()

			expect(itemsOf([john])).toEqual([])
		})

		it('should prepend the custom rowContextMenuTemplate to the generated items', async () => {
			fixture.component.edit = () => undefined
			fixture.component.delete = () => undefined
			fixture.component.rowContextMenuTemplate = () => html`
				<mo-context-menu-item data-test-id='custom'>Custom</mo-context-menu-item>
			`
			await fixture.updateComplete

			expect(itemsOf([john])).toEqual(['custom', 'edit', 'delete'])
		})

		const tick = () => new Promise(resolve => setTimeout(resolve))
		const idle = () => new Promise(resolve => {
			const heartbeat = setInterval(() => requestIdleCallback(() => undefined, { timeout: 10 }), 10)
			requestIdleCallback(() => {
				clearInterval(heartbeat)
				resolve(undefined)
			})
		})

		const untilTheFirstRowsContextMenuAnswers = async () => {
			const requestMenu = () => {
				const event = new MouseEvent('contextmenu', { cancelable: true })
				fixture.component.rows[0]!.content.dispatchEvent(event)
				return event.defaultPrevented
			}

			if (fixture.component.data.length === 0) {
				await new Promise(resolve => fixture.component.addEventListener('dataChange', () => resolve(undefined), { once: true }))
			}
			while (!fixture.component.rows[0]?.content) {
				await tick()
			}
			await fixture.component.rows[0]!.updateComplete

			let requested = false
			while (requested === false) {
				await idle()
				await tick()
				requested = requestMenu()
			}

			const menu = ContextMenu.openInstance!
			await menu.updateComplete
			while (menu.items.some(item => item.getAttribute('data-test-id') === 'edit') === false) {
				await menu.list.updateComplete
				await tick()
			}

			menu.close()
			const row = fixture.component.rows[0]!
			await row.updateComplete
			return row
		}

		// Disabled: Firefox timeout when awaiting lazy context menu
		xit('should run the primary edit context-menu action on row double-click', async () => {
			const edit = jasmine.createSpy('edit')
			fixture.component.edit = edit
			const row = await untilTheFirstRowsContextMenuAnswers()
			const doubleClicked = new Promise(resolve => fixture.component.addEventListener('rowDoubleClick', () => resolve(undefined), { once: true }))

			row.content.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
			await doubleClicked

			expect(edit).toHaveBeenCalledOnceWith(john)
		})
	})
})