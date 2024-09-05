import { component, DialogAlert, html } from '@3mo/del'
import { DialogMode, getPlainColumn, ModdableDataGrid, type ModdableDataGridChip, Mode, RepositoryController } from '.'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { faker } from '@faker-js/faker'
import localForage from 'localforage'

interface IUser {
	id: number
	firstName: string
	lastName: string
	age: number
}

type TParameters = {
	searchString?: string
}

const dummyData = new Array(100).fill(undefined).map((_, i) => ({
	id: i + 1,
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	age: Math.floor(Math.random() * 100) + 18,
})) as Array<IUser>

@component('story-moddable-data-grid')
class ModdableDataGridStory extends ModdableDataGrid<IUser, TParameters> {
	override fetch = (parameters: TParameters) => {
		return Promise.resolve(
			dummyData.filter(user => {
				let matches = true
				if (parameters.searchString) {
					matches &&= `${user.firstName} ${user.lastName}`
						.toLowerCase()
						.includes(parameters.searchString.toLowerCase())
				}
				return matches
			})
		)
	}

	override parameters = {}

	override get hasToolbar() {
		return true
	}

	override get toolbarDefaultTemplate() {
		return html`
			<mo-field-search ${this.parametersBinder.bind('searchString')}></mo-field-search>
		`
	}

	override get columnsTemplate() {
		return html`
			<mo-data-grid-column-number dataSelector='id' heading='ID' hidden></mo-data-grid-column-number>
			<mo-data-grid-column-text dataSelector='firstName' heading='First Name'></mo-data-grid-column-text>
			<mo-data-grid-column-text dataSelector='lastName' heading='Last Name'></mo-data-grid-column-text>
			<mo-data-grid-column-number dataSelector='age' heading='Age'></mo-data-grid-column-number>
		`
	}
}

const dummyModes = [
	new Mode({ id: '1', name: 'Mode 1', parameters: { searchString: 'Friedrich Nietzsche' } }),
	new Mode({ id: '2', name: 'Mode 2', parameters: {} }),
] as Array<Mode<IUser, TParameters>>

describe('ModdableDataGrid', () => {
	const storage: Record<string, any> = {}

	const fixture = new ComponentTestFixture(() => new ModdableDataGridStory)

	beforeAll(() => {
		spyOn(localForage, 'setItem').and.callFake((key: string, value: any) => Promise.resolve(storage[key] = value))
		spyOn(localForage, 'getItem').and.callFake((key: string) => Promise.resolve(storage[key]))
	})

	beforeEach(async () => {
		fixture.component.repository.value = []
		fixture.component.mode = undefined
		await fixture.updateComplete
	})

	afterEach(() => {
		Object.keys(storage).forEach(storageKey => storage[storageKey] = undefined)
	})

	const setupModes = async (modes: Array<Mode<IUser, TParameters>>) => {
		modes.forEach(mode => {
			mode.columns = fixture.component.currentMode.columns
			mode.sorting = fixture.component.sorting ?? []
			mode.pagination = fixture.component.pagination
		})
		fixture.component.repository.value = modes
		fixture.component.requestUpdate()
		await fixture.component.updateComplete
	}

	it('should have an icon in toolbar if there are no modes', () => {
		expect((fixture.component as any).hasModebar).toBeFalse()
		expect(fixture.component.renderRoot.querySelector('#toolbar [data-qa-id=addMode]')).not.toBeNull()
	})

	it('should open a dialog when clicks an icon in the toolbar', () => {
		spyOn(DialogMode.prototype, 'confirm')
		fixture.component.renderRoot.querySelector('#toolbar [data-qa-id=addMode]')?.dispatchEvent(new MouseEvent('click'))
		expect(DialogMode.prototype.confirm).toHaveBeenCalledTimes(1)
	})

	it('should have a modebar if there is at least one mode', async () => {
		await setupModes(dummyModes)
		expect((fixture.component as any).hasModebar).toBeTrue()
		expect(fixture.component.renderRoot.querySelector('#modebar')).not.toBeNull()
		expect(fixture.component.renderRoot.querySelector('[data-qa-id=addMode]')).toBeNull()
	})

	it('should display an archive icon if there is at least one archived mode', async () => {
		await setupModes(dummyModes.map(mode => new Mode({ ...mode, archived: true })))
		expect(fixture.component.renderRoot.querySelector('[data-qa-id=archive]')).not.toBeNull()
	})

	it('should display only unarchived modes', async () => {
		await setupModes([
			...dummyModes,
			...dummyModes.map(dummyMode => new Mode({ ...dummyMode, id: undefined, archived: true })),
		])
		const chipNodes =
			fixture.component.renderRoot.querySelectorAll<ModdableDataGridChip<IUser, TParameters>>('mo-moddable-data-grid-chip')!
		expect(chipNodes.length).toBe(2)
	})

	const initWithDefaultMode = async () => {
		const defaultModeIdKey = 'ModdableDataGrid.story-moddable-data-grid.Mode'
		const modesKey = 'ModdableDataGrid.story-moddable-data-grid.Modes'

		const modifiedColumns = fixture.component.currentMode.columns!.map((c, i) => {
			c.hidden = !!(i % 2)
			return c
		})

		storage[defaultModeIdKey] = dummyModes[0].id
		storage[modesKey] = dummyModes.map((mode, i) => i === 0 ? new Mode({ ...mode, columns: modifiedColumns as any }) : mode) as any

		await fixture.initialize()
		await fixture.updateComplete

		await Promise.sleep(1)

		return modifiedColumns
	}

	it('should set default mode on initialization', async () => {
		const modifiedColumns = await initWithDefaultMode()
		expect((fixture.component as any).defaultModeIdStorage.value).toBe(dummyModes[0].id)
		expect(fixture.component.currentMode.columns?.map(getPlainColumn)).toEqual(modifiedColumns.map(getPlainColumn))
	})

	it('should reset mode to default', async () => {
		await fixture.initialize()

		const defaultColumns = fixture.component.currentMode.columns?.map(getPlainColumn)

		await initWithDefaultMode()

		fixture.component.selectedModeNode.renderRoot.querySelector('#container')!.dispatchEvent(new MouseEvent('click'))
		await fixture.updateComplete

		expect(fixture.component.currentMode.columns?.map(getPlainColumn)).toEqual(defaultColumns)
	})

	describe('ModdableDataGridChip', () => {
		const selectMode = async (openMenu = false) => {
			const chipNode = fixture.component.renderRoot.querySelector<ModdableDataGridChip<IUser, TParameters>>('mo-moddable-data-grid-chip')!
			chipNode.shadowRoot?.querySelector('#container')?.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete
			if (openMenu) {
				[...chipNode.renderRoot.querySelectorAll('mo-icon-button')].at(-1)!.dispatchEvent(new MouseEvent('click'))
			}
			return chipNode
		}

		it('should change a mode on clicking a chip', async () => {
			await setupModes(dummyModes)
			const chipNode = await selectMode()
			expect(fixture.component.mode).toEqual(chipNode.mode)
		})

		it('should apply changes to data grid on switching modes', async () => {
			await setupModes(dummyModes)
			const chipNode = await selectMode()
			expect(fixture.component.parameters).toEqual(chipNode.mode.parameters!)

			fixture.component.mode = undefined
			await fixture.updateComplete
			expect(fixture.component.parameters).toEqual({ searchString: undefined })
		})

		it('should display shortcuts and have more context menu items if there are any changes', async () => {
			await setupModes(dummyModes)
			const chipNode = await selectMode()

			let iconsNodes = chipNode.renderRoot.querySelectorAll('mo-icon-button')

			expect(iconsNodes.length).toBe(1)

			;[...chipNode.renderRoot.querySelectorAll('mo-icon-button')].at(-1)!.dispatchEvent(new MouseEvent('click'))
			expect(chipNode.renderRoot.querySelectorAll('mo-context-menu-item').length).toBe(4)

			fixture.component.parameters = { ...fixture.component.parameters, searchString: '' }
			await fixture.updateComplete
			iconsNodes = chipNode.renderRoot.querySelectorAll('mo-icon-button')
			expect(iconsNodes.length).toBe(3)

			;[...chipNode.renderRoot.querySelectorAll('mo-icon-button')].at(-1)!.dispatchEvent(new MouseEvent('click'))
			expect(chipNode.renderRoot.querySelectorAll('mo-context-menu-item').length).toBe(7)
		})

		it('should discard changes on clicking "undo" icon', async () => {
			await setupModes(dummyModes)
			const chipNode = await selectMode()

			fixture.component.parameters = { ...fixture.component.parameters, searchString: '' }
			await fixture.updateComplete

			spyOn(DialogAlert.prototype, 'confirm').and.callFake(() => Promise.resolve())
			chipNode.renderRoot.querySelector('mo-icon-button')!.dispatchEvent(new MouseEvent('click'))
			await Promise.sleep(1)
			await fixture.updateComplete

			expect((fixture.component.parameters as TParameters).searchString).toBe(chipNode.mode.parameters?.searchString)
		})

		it('should apply changes on clicking "done" icon', async () => {
			await setupModes(dummyModes)
			const chipNode = await selectMode()

			fixture.component.parameters = { ...fixture.component.parameters, searchString: '' }
			await fixture.updateComplete

			chipNode.renderRoot.querySelector('mo-icon-button:last-of-type')!.dispatchEvent(new MouseEvent('click'))
			await Promise.sleep(1)
			await fixture.updateComplete

			expect(chipNode.mode.parameters?.searchString).toBe('')
			expect(fixture.component.repository.value.find(mode => mode.id === chipNode.mode.id)?.parameters?.searchString).toBe('')
		})

		it('should delete a mode on clicking "delete" icon', async () => {
			spyOn(RepositoryController.prototype, 'delete').and.returnValue(Promise.resolve())

			await setupModes(dummyModes)

			const chipNode = await selectMode(true)
			chipNode.renderRoot.querySelector('[data-qa-id=delete]')!.dispatchEvent(new MouseEvent('click'))

			expect(RepositoryController.prototype.delete).toHaveBeenCalledTimes(1)
			expect(RepositoryController.prototype.delete).toHaveBeenCalledWith(chipNode.mode)
		})

		it('should archive or unarchive a mode on clicking "archive" icon', async () => {
			await setupModes(dummyModes)

			const chipNode = await selectMode(true)

			chipNode.renderRoot.querySelector('[data-qa-id=archive]')!.dispatchEvent(new MouseEvent('click'))
			expect(chipNode.mode.archived).toBe(true)
		})

		it('should open a copying dialog on clicking "content_copy" icon', async () => {
			let parameters!: typeof DialogMode.prototype['parameters']

			spyOn(DialogMode.prototype, 'confirm').and.callFake(function(this: DialogMode<unknown, any>) {
				parameters = this.parameters
				return Promise.resolve(undefined)
			})

			await setupModes(dummyModes)

			const chipNode = await selectMode(true)
			chipNode.renderRoot.querySelector('[data-qa-id=copy]')!.dispatchEvent(new MouseEvent('click'))

			expect(DialogMode.prototype.confirm).toHaveBeenCalledTimes(1)
			expect(parameters.mode).toEqual(chipNode.mode)
			expect(parameters.isCopying).toBeTrue()
		})

		it('should open an edit dialog on cicking "edit" icon', async () => {
			let parameters!: typeof DialogMode.prototype['parameters']

			await setupModes(dummyModes)

			spyOn(DialogMode.prototype, 'confirm').and.callFake(function(this: DialogMode<unknown, any>) {
				parameters = this.parameters
				return Promise.resolve(undefined)
			})

			const chipNode = await selectMode(true)
			chipNode.renderRoot.querySelector('[data-qa-id=edit]')!.dispatchEvent(new MouseEvent('click'))

			expect(DialogMode.prototype.confirm).toHaveBeenCalledTimes(1)
			expect(parameters.mode).toEqual(chipNode.mode)
		})

		it('should open a create as new dialog on clicking "check_circle"', async () => {
			let parameters!: typeof DialogMode.prototype['parameters']

			await setupModes(dummyModes)

			spyOn(DialogMode.prototype, 'confirm').and.callFake(function(this: DialogMode<unknown, any>) {
				parameters = this.parameters
				return Promise.resolve(undefined)
			})

			const chipNode = await selectMode()
			fixture.component.parameters = { ...fixture.component.parameters, searchString: '' }
			await fixture.updateComplete

			;[...chipNode.renderRoot.querySelectorAll('mo-icon-button')].at(-1)!.dispatchEvent(new MouseEvent('click'))
			chipNode.renderRoot.querySelector('[data-qa-id=saveAsNew]')!.dispatchEvent(new MouseEvent('click'))

			expect(DialogMode.prototype.confirm).toHaveBeenCalledTimes(1)
			expect(parameters.mode).toEqual(new Mode<unknown, any>({ ...fixture.component.currentMode, id: parameters.mode!.id, name: '' } as any))
			expect(parameters.isNew).toBeTrue()
		})
	})
})