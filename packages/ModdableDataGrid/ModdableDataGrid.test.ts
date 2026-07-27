import { component, DialogAlert, html } from '@3mo/del'
import { DialogMode, ModdableDataGrid, type ModdableDataGridChip, ModdableDataGridMode, ModdableDataGridModeColumn, type ModdableDataGridModesAdapter } from './index.js'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { faker } from '@faker-js/faker'

interface User {
	id: number
	firstName: string
	lastName: string
	age: number
}

type Parameters = {
	keyword?: string
}

const dummyData = new Array(100).fill(undefined).map((_, i) => ({
	id: i + 1,
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	age: Math.floor(Math.random() * 100) + 18,
})) as Array<User>

class ModesAdapterMock implements ModdableDataGridModesAdapter<User, Parameters> {
	modes = new Array<ModdableDataGridMode<User, Parameters>>()
	selectedModeId?: string

	getAll = () => Promise.resolve(this.modes)
	get = (_: string, modeId: string) => Promise.resolve(this.modes.find(m => m.id === modeId))
	save = (_: string, mode: ModdableDataGridMode<User, Parameters>) => {
		this.modes = this.modes.map(m => m.id === mode.id ? mode : m)
		return Promise.resolve(mode)
	}
	delete = (_: string, mode: ModdableDataGridMode<User, Parameters>) => {
		this.modes = this.modes.filter(m => m.id !== mode.id)
		return Promise.resolve()
	}
	getSelectedId = () => Promise.resolve(this.selectedModeId)
	setSelectedId = (_: string, modeId: string) => {
		this.selectedModeId = modeId
		return Promise.resolve()
	}
}

@component('story-moddable-data-grid')
class ModdableDataGridStory extends ModdableDataGrid<User, Parameters> {
	override fetch = (parameters: Parameters) => {
		return Promise.resolve(
			dummyData.filter(user => {
				let matches = true
				if (parameters.keyword) {
					matches &&= `${user.firstName} ${user.lastName}`
						.toLowerCase()
						.includes(parameters.keyword.toLowerCase())
				}
				return matches
			})
		)
	}

	override modesAdapter = new ModesAdapterMock()

	override parameters = {}

	override get hasToolbar() {
		return true
	}

	override get toolbarDefaultTemplate() {
		return html`
			<mo-field-search ${this.parametersBinder.bind('keyword')}></mo-field-search>
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

class ModdableDataGridTestFixture extends ComponentTestFixture<ModdableDataGridStory> {
	// Shaped like the modes persisted before columns were split into definitions and modifications:
	// a full snapshot of every column with all of its properties materialized, which is a valid —
	// merely fully specified rather than partial — set of modifications. @see 'Legacy modes'
	static readonly columns = [
		new ModdableDataGridModeColumn<User>({ dataSelector: 'id', width: 'max-content', hidden: true, sticky: undefined }),
		new ModdableDataGridModeColumn<User>({ dataSelector: 'firstName', width: 'max-content', hidden: false, sticky: undefined }),
		new ModdableDataGridModeColumn<User>({ dataSelector: 'lastName', width: 'max-content', hidden: false, sticky: undefined }),
		new ModdableDataGridModeColumn<User>({ dataSelector: 'age', width: 'max-content', hidden: false, sticky: undefined }),
	]

	// An untouched data grid has no columns modifications, so the default mode carries no column intent
	static readonly defaultMode = new ModdableDataGridMode<User, Parameters>({
		id: undefined,
		name: undefined,
		parameters: {},
	})

	static get modes(): ModdableDataGridMode<User, Parameters>[] {
		return [
			new ModdableDataGridMode({
				id: '1',
				name: 'Mode 1',
				parameters: { keyword: 'Friedrich Nietzsche' } as Parameters,
				columns: ModdableDataGridTestFixture.columns
			}),
			new ModdableDataGridMode({
				id: '2',
				name: 'Mode 2',
				parameters: {},
				columns: [
					new ModdableDataGridModeColumn({ dataSelector: 'id', width: 'max-content', hidden: false, sticky: undefined }), // Changed hidden to false
					ModdableDataGridTestFixture.columns[1]!,
					new ModdableDataGridModeColumn({ dataSelector: 'lastName', width: '200px', hidden: false, sticky: undefined }), // Changed width to 200px
					ModdableDataGridTestFixture.columns[3]!,
				]
			}),
		]
	}

	constructor(readonly options: {
		readonly modes: ModdableDataGridMode<User, Parameters>[]
		readonly selectedModeId?: '1' | '2'
	}) {
		super(() => {
			const dataGrid = new ModdableDataGridStory
			dataGrid.modesAdapter.modes = options.modes
			dataGrid.modesAdapter.selectedModeId = options.selectedModeId
			return dataGrid
		})
		beforeEach(() => spyOn(this.component.fetcherController, 'fetch').and.callThrough())
	}

	expectModeToBeSelected(modeId: 'default' | '1' | '2') {
		modeId = modeId === 'default' ? undefined! : modeId
		expect(this.component.modesAdapter.selectedModeId).toBe(modeId)
		const mode = this.options.modes.find(m => m.id === modeId) ?? ModdableDataGridTestFixture.defaultMode
		expect(this.component.currentMode.name).toEqual(mode.name)
		expect(this.component.currentMode['definedParameters']).toEqual(mode['definedParameters'])
		expect(this.component.currentMode.columns).toEqual(mode.columns)
	}

	get modes() {
		return this.component.modesAdapter.modes
	}

	get addModeIconButton() {
		return this.component.renderRoot.querySelector('mo-icon-button[data-test-id=add-mode]')
	}

	get archiveIconButton() {
		return this.component.renderRoot.querySelector('mo-icon-button[data-test-id=archive]')
	}

	get modeChips() {
		return [...this.component.renderRoot.querySelectorAll<ModdableDataGridChip<User, Parameters>>('mo-moddable-data-grid-chip')]
	}

	get selectedModeChip() {
		return this.modeChips.find(chip => chip.selected)
	}

	async selectChip(chip: ModdableDataGridChip<User, Parameters>) {
		chip.dispatchEvent(new MouseEvent('click'))
		await new Promise(r => setTimeout(r))
	}
}

describe('ModdableDataGrid', () => {
	describe('No modes', () => {
		const fixture = new ModdableDataGridTestFixture({ modes: [] })

		it('should have requested fetch only once on initialization', async () => {
			await new Promise<void>(r => setTimeout(r))
			expect(fixture.component.fetcherController.fetch).toHaveBeenCalledTimes(1)
		})

		describe('Mode creation icon-button', () => {
			it('should exist in the toolbar if there are no modes', () => {
				expect(fixture.component['hasModebar']).toBeFalse()
				expect(fixture.addModeIconButton).not.toBeNull()
			})

			it('should open the mode dialog when clicked', () => {
				spyOn(DialogMode.prototype, 'confirm')
				fixture.addModeIconButton?.dispatchEvent(new MouseEvent('click'))
				expect(DialogMode.prototype.confirm).toHaveBeenCalledTimes(1)
			})
		})
	})

	describe('With modes', () => {
		const fixture = new ModdableDataGridTestFixture({ modes: ModdableDataGridTestFixture.modes })

		// It takes a bit for chips to be rendered due to the async nature of the component
		beforeEach(() => new Promise<void>(r => setTimeout(r)))

		it('should have requested fetch only once on initialization', () => {
			expect(fixture.component.fetcherController.fetch).toHaveBeenCalledTimes(1)
		})

		it('should have a modebar if there is at least one mode', () => {
			expect(fixture.component['hasModebar']).toBeTrue()
			expect(fixture.component.renderRoot.querySelector('#modebar')).not.toBeNull()
			expect(fixture.addModeIconButton).toBeNull()
		})

		it('should not display archive icon-button as there are no archived modes', () => {
			expect(fixture.archiveIconButton).toBeNull()
		})

		it('should render chips for each non-archived mode', () => {
			expect(fixture.modeChips.length).toBe(2)
		})

		it('should select the associated mode when a chip is clicked', async () => {
			fixture.expectModeToBeSelected('default')

			fixture.modeChips[0]!.dispatchEvent(new MouseEvent('click'))
			await fixture.updateComplete

			fixture.expectModeToBeSelected('1')
		})

		xit('should display shortcuts and have more context menu items if there are change to the current view', async () => {
			const chip = fixture.modeChips[0]!

			// Why does the initial chip has changes?
			chip.dispatchEvent(new MouseEvent('click'))
			chip.mode.save(fixture.component)
			await new Promise<void>(r => setTimeout(r, 20))
			expect(chip.renderRoot.querySelectorAll('mo-icon-button').length).toBe(1)
			expect(chip.renderRoot.querySelectorAll('mo-menu-item').length).toBe(4)

			fixture.component.parameters = { ...fixture.component.parameters, keyword: '' }

			await fixture.updateComplete
			expect(chip.renderRoot.querySelectorAll('mo-icon-button').length).toBe(3)
			expect(chip.renderRoot.querySelectorAll('mo-menu-item').length).toBe(7)
		})

		it('should discard changes when "undo" icon-button is clicked', async () => {
			const chip = fixture.modeChips[0]!
			await fixture.selectChip(chip)

			fixture.component.parameters = { ...fixture.component.parameters, keyword: '' }
			await fixture.updateComplete

			spyOn(DialogAlert.prototype, 'confirm').and.callFake(() => Promise.resolve())
			chip.renderRoot.querySelector('mo-icon-button[icon=undo]')?.dispatchEvent(new MouseEvent('click'))
			await new Promise(r => setTimeout(r))
			await fixture.updateComplete

			expect((fixture.component.parameters as Parameters).keyword).toBe('Friedrich Nietzsche')
		})

		it('should apply changes when clicking "done" icon', async () => {
			const chip = fixture.modeChips[0]!
			await fixture.selectChip(chip)

			fixture.component.parameters = { ...fixture.component.parameters, keyword: '' }
			await fixture.updateComplete

			chip.renderRoot.querySelector('mo-icon-button[icon=done]')!.dispatchEvent(new MouseEvent('click'))
			await new Promise(r => setTimeout(r))
			await fixture.updateComplete

			expect(chip.mode.parameters?.keyword).toBe('')
			expect(fixture.component.modesAdapter.modes.find(m => m.id === chip.mode.id)?.parameters?.keyword).toBe('')
		})

		it('should delete the mode when clicking "delete" icon-button', async () => {
			spyOn(fixture.component.modesController, 'delete')

			const chip = fixture.modeChips[0]!
			await fixture.selectChip(chip)
			chip.renderRoot.querySelector('mo-menu-item[data-test-id=delete]')!.dispatchEvent(new MouseEvent('click'))

			expect(fixture.component.modesController.delete).toHaveBeenCalledTimes(1)
			expect(fixture.component.modesController.delete).toHaveBeenCalledWith(chip.mode)
		})


		it('should archive or unarchive a mode when "archive" icon-button is clicked', async () => {
			const chip = fixture.modeChips[0]!
			await fixture.selectChip(chip)
			spyOn(chip.mode, 'archive')

			chip.renderRoot.querySelector('[data-test-id=archive]')!.dispatchEvent(new MouseEvent('click'))

			expect(chip.mode.archive).toHaveBeenCalledOnceWith(fixture.component)
		})

		it('should open the mode dialog when "edit" menu-item is clicked', async () => {
			let parameters!: typeof DialogMode.prototype['parameters']
			spyOn(DialogMode.prototype, 'confirm').and.callFake(function (this: DialogMode<unknown, any>) {
				parameters = this.parameters
				return Promise.resolve(undefined)
			})
			const chip = fixture.modeChips[0]!
			await fixture.selectChip(chip)

			chip.renderRoot.querySelector('[data-test-id=edit]')!.dispatchEvent(new MouseEvent('click'))

			expect(DialogMode.prototype.confirm).toHaveBeenCalledTimes(1)
			expect(parameters.dataGrid).toEqual(fixture.component)
			expect(parameters.mode).toEqual(chip.mode)
		})

		it('should open a mode dialog to "save changes as new view" when "save as new" menu-item is clicked', async () => {
			let parameters!: typeof DialogMode.prototype['parameters']
			spyOn(DialogMode.prototype, 'confirm').and.callFake(function (this: DialogMode<unknown, any>) {
				parameters = this.parameters
				return Promise.resolve(undefined)
			})

			const chip = fixture.modeChips[0]!
			await fixture.selectChip(chip)
			fixture.component.parameters = { ...fixture.component.parameters, keyword: '' }
			await fixture.updateComplete

			chip.renderRoot.querySelector('[data-test-id=save-as-new]')!.dispatchEvent(new MouseEvent('click'))

			expect(DialogMode.prototype.confirm).toHaveBeenCalledTimes(1)
			expect(parameters.mode).toEqual(new ModdableDataGridMode<unknown, any>({ ...fixture.component.currentMode, id: parameters.mode!.id, name: '' } as any))
		})

		describe('With archived mode', () => {
			const fixture = new ModdableDataGridTestFixture({
				modes: ModdableDataGridTestFixture.modes.map((m, i) => {
					m.archived = i === 1
					return m
				})
			})

			it('should display an archive icon-button when at least one mode is archived', () => {
				expect(fixture.archiveIconButton).not.toBeNull()
			})

			it('should render chips for each non-archived mode', () => {
				expect(fixture.modeChips.length).toBe(1)
			})
		})

		describe('With pre-selected mode', () => {
			const fixture = new ModdableDataGridTestFixture({ modes: ModdableDataGridTestFixture.modes, selectedModeId: '2' })

			// The columns are not extracted/applied immediately, so we need to wait for the next microtask
			beforeEach(() => new Promise(r => setTimeout(r)))

			it('should have requested fetch only once on initialization', () => {
				expect(fixture.component.fetcherController.fetch).toHaveBeenCalledTimes(1)
			})

			it('should apply pre-selected mode on initialization', () => fixture.expectModeToBeSelected('2'))

			it('should reset to the "default" mode when clicking the pre-selected mode', async () => {
				fixture.selectedModeChip?.dispatchEvent(new MouseEvent('click'))

				await fixture.updateComplete

				fixture.expectModeToBeSelected('default')
			})
		})
	})

	describe('Asynchronously rendered columns', () => {
		const fixture = new ModdableDataGridTestFixture({ modes: ModdableDataGridTestFixture.modes, selectedModeId: '2' })

		// Columns are not extracted/applied immediately, so we wait for the next macrotask
		beforeEach(() => new Promise(r => setTimeout(r)))

		const hasColumn = (dataSelector: string) => fixture.component.columns.some(c => (c.dataSelector as string) === dataSelector)

		const appendColumnAfterRender = async (dataSelector: string) => {
			const column = document.createElement('mo-data-grid-column-text') as any
			column.dataSelector = dataSelector
			column.heading = dataSelector
			fixture.component.appendChild(column)
			await new Promise(r => setTimeout(r))
			await fixture.updateComplete
		}

		it('should surface a column rendered after a mode has been applied', async () => {
			fixture.expectModeToBeSelected('2')
			expect(hasColumn('score')).toBeFalse()

			await appendColumnAfterRender('score')

			expect(hasColumn('score')).toBeTrue()
		})

		it('should not let an app-provided column add unsaved changes to a selected mode', async () => {
			// Select a mode that mirrors the current view exactly, so the baseline is genuinely clean
			// (the seeded fixture modes do not round-trip and would report changes regardless).
			const cleanMode = fixture.component.currentMode.with({ id: 'clean', name: 'Clean' })
			fixture.component.modesAdapter.modes = [cleanMode]
			await fixture.component.modesController.set(cleanMode)
			await fixture.updateComplete
			expect(fixture.component.hasUnsavedChanges).toBeFalse()

			await appendColumnAfterRender('score')

			expect(hasColumn('score')).toBeTrue()
			expect(fixture.component.hasUnsavedChanges).toBeFalse()
		})

		it('should restore the saved modification of a mode column whose element renders late', async () => {
			const currentMode = fixture.component.currentMode
			const modeWithLateColumn = currentMode.with({
				id: 'late',
				name: 'Late',
				columns: [
					...currentMode.columns!,
					new ModdableDataGridModeColumn<User>({ dataSelector: 'score' as KeyPath.Of<User>, width: '321px', hidden: false, sticky: undefined }),
				],
			})
			fixture.component.modesAdapter.modes = [modeWithLateColumn]
			await fixture.component.modesController.set(modeWithLateColumn)
			await fixture.updateComplete
			expect(hasColumn('score')).toBeFalse()

			await appendColumnAfterRender('score')

			expect(hasColumn('score')).toBeTrue()
			expect(fixture.component.columns.find(c => (c.dataSelector as string) === 'score')?.width).toBe('321px')
			expect(fixture.component.hasUnsavedChanges).toBeFalse()
		})
	})

	// Modes persisted before columns were split into definitions and modifications stored a full
	// snapshot of every column instead of only the user's intent. Such a snapshot is a fully
	// specified set of modifications, so it keeps working without any migration of stored data.
	describe('Legacy modes', () => {
		const fixture = new ModdableDataGridTestFixture({ modes: ModdableDataGridTestFixture.modes, selectedModeId: '2' })

		beforeEach(() => new Promise(r => setTimeout(r)))

		// Serialized exactly as modes were before the split, being a snapshot of every column with all
		// of its properties materialized. It is derived from the current mode so that everything but
		// the columns round-trips, as the seeded fixture modes do not.
		const selectLegacyMode = async () => {
			const legacyMode = fixture.component.currentMode.with({
				id: 'legacy',
				name: 'Legacy',
				columns: fixture.component.columns.map(c => ModdableDataGridModeColumn.fromColumn(c)),
			})
			fixture.component.modesAdapter.modes = [legacyMode]
			await fixture.component.modesController.set(legacyMode)
			await fixture.updateComplete
			return legacyMode
		}

		it('should apply a full column snapshot without reporting unsaved changes', async () => {
			const legacyMode = await selectLegacyMode()

			// Every property is specified, so the snapshot wins over the column elements' declarations
			expect(legacyMode.columns!.every(c => c.width !== undefined && c.hidden !== undefined)).toBeTrue()
			expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['id', 'firstName', 'lastName', 'age'])
			expect(fixture.component.columns.find(c => c.dataSelector === 'lastName')?.width).toBe('200px')
			expect(fixture.component.hasUnsavedChanges).toBeFalse()
		})

		it('should surface a column the snapshot does not know instead of dropping it', async () => {
			await selectLegacyMode()

			const column = document.createElement('mo-data-grid-column-text') as any
			column.dataSelector = 'score'
			column.heading = 'Score'
			fixture.component.appendChild(column)
			await new Promise(r => setTimeout(r))
			await fixture.updateComplete

			expect(fixture.component.columns.map(c => c.dataSelector)).toEqual(['id', 'firstName', 'lastName', 'age', 'score' as any])
			expect(fixture.component.hasUnsavedChanges).toBeFalse()
		})
	})
})