import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { component, html, style } from '@a11d/lit'
import { DataGridSortingStrategy } from '@3mo/data-grid'
import p from './package.json'
import { IndexedDbAdapter, ModdableDataGrid, ModdableDataGridMode, ModdableDataGridModeColumn, type DataGridKey, type ModdableDataGridModesAdapter, type ModeId } from './index.js'

export default {
	title: 'Data Display / Moddable Data Grid',
	package: p,
} as Meta

type Person = {
	id: number
	name: string
	city: string
	age: number
	joined: DateTime
}

type Parameters = {
	keyword?: string
	city?: string
	joined?: DateTimeRange
}

const cities = ['Berlin', 'Hamburg', 'München', 'Köln']

const people = [
	'Octavia Blake', 'Charmaine Diyoza', 'Clarke Griffin', 'Elliot Alderson', 'Arya Stark',
	'Darlene Alderson', 'Max Caufield', 'Bellamy Blake', 'Raven Reyes', 'John Murphy',
	'Marcus Kane', 'Abigail Griffin', 'Jasper Jordan', 'Monty Green', 'Emori Blackwood',
].map((name, index) => ({
	id: index + 1,
	name,
	city: cities[index % cities.length]!,
	age: 18 + (index * 7) % 45,
	joined: new DateTime(2020 + index % 6, index % 12, 1 + index % 27),
})) as Array<Person>

class InMemoryModesAdapter implements ModdableDataGridModesAdapter<Person, Parameters> {
	constructor(private modes: Array<ModdableDataGridMode<Person, Parameters>> = []) { }

	private selectedId?: ModeId

	getAll = () => Promise.resolve(this.modes)

	get = (_: DataGridKey, modeId: ModeId) => Promise.resolve(this.modes.find(m => m.id === modeId))

	save = (_: DataGridKey, mode: ModdableDataGridMode<Person, Parameters>) => {
		this.modes = this.modes.some(m => m.id === mode.id)
			? this.modes.map(m => m.id === mode.id ? mode : m)
			: [mode, ...this.modes]
		return Promise.resolve(mode)
	}

	delete = (_: DataGridKey, mode: ModdableDataGridMode<Person, Parameters>) => {
		this.modes = this.modes.filter(m => m.id !== mode.id)
		return Promise.resolve()
	}

	getSelectedId = () => Promise.resolve(this.selectedId)

	setSelectedId = (_: DataGridKey, modeId: ModeId | undefined) => {
		this.selectedId = modeId
		return Promise.resolve()
	}
}

const mode = (init: Partial<ModdableDataGridMode<Person, Parameters>>) =>
	new ModdableDataGridMode<Person, Parameters>(init)

const seededModes = () => [
	mode({ id: 'everyone', name: 'Everyone' }),
	mode({ id: 'berlin', name: 'Berlin', parameters: { city: 'Berlin' } }),
	mode({
		id: 'eldest',
		name: 'Eldest first',
		sorting: [{ selector: 'age', strategy: DataGridSortingStrategy.Descending }],
		pagination: 10,
	}),
	mode({
		id: 'joined-recently',
		name: 'Joined since 2024',
		parameters: { joined: new DateTimeRange(new DateTime(2024, 0, 1), undefined) },
	}),
	mode({
		id: 'names-only',
		name: 'Names only',
		columns: [
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'name' }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'city' }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'id', hidden: true }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'age', hidden: true }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'joined', hidden: true }),
		],
	}),
]

@component('story-moddable-data-grid')
class StoryModdableDataGrid extends ModdableDataGrid<Person, Parameters> {
	override parameters: Parameters = {}

	override fetch = async (parameters: Parameters) => {
		await new Promise(r => setTimeout(r, 250))
		return people.filter(person =>
			(!parameters.keyword || person.name.toLowerCase().includes(parameters.keyword.toLowerCase()))
			&& (!parameters.city || person.city === parameters.city)
			&& (!parameters.joined || parameters.joined.includes(person.joined)))
	}

	override get hasToolbar() {
		return true
	}

	override get toolbarDefaultTemplate() {
		return html`
			<mo-field-search ${style({ minWidth: '180px' })} ${this.parametersBinder.bind('keyword')}></mo-field-search>
			<mo-field-select label='City' ${style({ minWidth: '140px' })} ${this.parametersBinder.bind('city')}>
				<mo-option value=''>All</mo-option>
				${cities.map(city => html`<mo-option value=${city}>${city}</mo-option>`)}
			</mo-field-select>
			<mo-field-date-range label='Joined' ${style({ minWidth: '220px' })} ${this.parametersBinder.bind('joined')}></mo-field-date-range>
		`
	}

	override get columnsTemplate() {
		return html`
			<mo-data-grid-column-number heading='ID' dataSelector='id' width='60px'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name' width='1fr'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='City' dataSelector='city' width='1fr'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' width='80px'></mo-data-grid-column-number>
			<mo-data-grid-column-date heading='Joined' dataSelector='joined' width='140px'></mo-data-grid-column-date>
		`
	}
}

StoryModdableDataGrid

const story = (adapter: ModdableDataGridModesAdapter<Person, Parameters>): StoryObj => ({
	render: () => html`
		<story-moddable-data-grid ${style({ height: '540px' })} .modesAdapter=${adapter}></story-moddable-data-grid>
	`
})

export const Views: StoryObj = story(new InMemoryModesAdapter(seededModes()))

export const WithoutViews: StoryObj = story(new InMemoryModesAdapter())

export const WithArchivedViews: StoryObj = story(new InMemoryModesAdapter([
	...seededModes(),
	mode({ id: 'archived-koln', name: 'Köln', archived: true, parameters: { city: 'Köln' } }),
	mode({ id: 'archived-youngest', name: 'Youngest first', archived: true, sorting: [{ selector: 'age', strategy: DataGridSortingStrategy.Ascending }] }),
]))

export const PersistedInIndexedDb: StoryObj = story(new IndexedDbAdapter())