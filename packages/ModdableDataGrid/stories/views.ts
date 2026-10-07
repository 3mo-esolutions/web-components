import { DataGridSortingStrategy } from '@3mo/data-grid'
import { ModdableDataGridMode, ModdableDataGridModeColumn } from '@3mo/moddable-data-grid'
import type { PeopleParameters } from './PeopleDataGrid.js'
import type { Person } from '../../../stories/index.js'

export const views = () => [
	new ModdableDataGridMode<Person, PeopleParameters>({ id: 'everyone', name: 'Everyone' }),
	new ModdableDataGridMode<Person, PeopleParameters>({ id: 'berlin', name: 'Berlin', parameters: { city: 'Berlin' } }),
	new ModdableDataGridMode<Person, PeopleParameters>({
		id: 'eldest',
		name: 'Eldest first',
		sorting: [{ selector: 'age', strategy: DataGridSortingStrategy.Descending }],
		pagination: '10',
	}),
	new ModdableDataGridMode<Person, PeopleParameters>({
		id: 'born-after-2000',
		name: 'Born after 2000',
		parameters: { birthDate: new DateTimeRange(new DateTime(2000, 0, 1), undefined) },
	}),
	new ModdableDataGridMode<Person, PeopleParameters>({
		id: 'names-only',
		name: 'Names only',
		columns: [
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'name' }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'city' }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'id', hidden: true }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'occupation', hidden: true }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'age', hidden: true }),
			new ModdableDataGridModeColumn<Person>({ dataSelector: 'birthDate', hidden: true }),
		],
	}),
]

export const archivedViews = () => [
	new ModdableDataGridMode<Person, PeopleParameters>({ id: 'archived-london', name: 'London', archived: true, parameters: { city: 'London' } }),
	new ModdableDataGridMode<Person, PeopleParameters>({ id: 'archived-youngest', name: 'Youngest first', archived: true, sorting: [{ selector: 'age', strategy: DataGridSortingStrategy.Ascending }] }),
]
