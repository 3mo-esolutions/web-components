import { html } from '@a11d/lit'
import { type DataGridController } from './DataGridController.js'
import { DataGridColumn } from './DataGridColumn.js'
import { DataGridRecordsController } from './DataGridRecordsController.js'
import { DataGridSortingController, DataGridSortingStrategy, type DataGridSorting } from './DataGridSortingController.js'
import { DataRecord } from './DataRecord.js'

type Person = { id: number, name: string, children?: Array<Person> }

const people: Array<Person> = [
	{ id: 2, name: 'Bob', children: [{ id: 21, name: 'Bob Jr' }, { id: 22, name: 'Alice Jr' }] },
	{ id: 1, name: 'Alice' },
]

describe('DataGridRecordsController', () => {
	const create = (sorting?: DataGridSorting<Person>) => {
		const source = { data: people, sorting, subDataGridDataSelector: 'children' as KeyPath.Of<Person> }
		const controller = {
			sorting: new DataGridSortingController<Person>(source),
			selection: { isSelected: (data: Person) => data.id === 1, isSelectable: (data: Person) => data.id !== 21 },
			details: { isOpen: (record: DataRecord<Person>) => record.data.id === 2, hasDetail: (record: DataRecord<Person>) => record.hasSubData },
		} as unknown as DataGridController<Person>
		const records = new DataGridRecordsController<Person>(source, controller)
		Object.assign(controller, { records })
		return { source, controller, records }
	}

	const names = (records: ReadonlyArray<DataRecord<Person>> | undefined) => records?.map(record => record.data.name)

	it('should derive the records in pre-order, each with its position and level, without any element', () => {
		const { records } = create()

		expect(records.records.map(record => [record.data.name, record.index, record.level])).toEqual([
			['Bob', 0, 0],
			['Bob Jr', 1, 1],
			['Alice Jr', 2, 1],
			['Alice', 3, 0],
		])
	})

	it('should sort every level by the sorting', () => {
		const { records } = create({ selector: 'name', strategy: DataGridSortingStrategy.Ascending })

		expect(names(records.records)).toEqual(['Alice', 'Bob', 'Alice Jr', 'Bob Jr'])
	})

	it('should derive again only once the data changed', () => {
		const { source, records } = create()
		const derived = records.records

		expect(records.records).toBe(derived)

		source.data = [...people]
		expect(records.records).not.toBe(derived)
	})

	it('should derive the records of data it does not hold, such as a filtered export', () => {
		const { records } = create()

		expect(names(records.recordsOf([people[1]!]))).toEqual(['Alice'])
	})

	it('should find the sub records of a record made by hand, sorted', () => {
		const { controller } = create({ selector: 'name', strategy: DataGridSortingStrategy.Ascending })
		const record = new DataRecord(controller, { data: people[0]!, index: 0, level: 0 })

		expect(names(record.subDataRecords)).toEqual(['Alice Jr', 'Bob Jr'])
		expect(record.subDataRecords?.map(sub => sub.level)).toEqual([1, 1])
	})

	it('should ask the controller for a record\'s selection and details', () => {
		const { records } = create()
		const [bob, bobJr, , alice] = records.records

		expect([bob!.isSelected, alice!.isSelected]).toEqual([false, true])
		expect([bob!.isSelectable, bobJr!.isSelectable]).toEqual([true, false])
		expect([bob!.detailsOpen, alice!.detailsOpen]).toEqual([true, false])
		expect([bob!.hasDetails, alice!.hasDetails]).toEqual([true, false])
	})

	it('should remember a column\'s longest content per template, so that a column of another template for the same data measures again', () => {
		const { records } = create()
		const generated = new DataGridColumn<Person>({ dataSelector: 'name', heading: 'Name', getContentTemplate: value => html`${value}` })
		const declared = generated.with({ getContentTemplate: value => html`<b>${value}</b>` })
		const derive = vi.fn(() => html.nothing)

		records.longestContentOf(generated, derive)
		records.longestContentOf(generated, derive)
		expect(derive).toHaveBeenCalledTimes(1)

		records.longestContentOf(declared, derive)
		expect(derive).toHaveBeenCalledTimes(2)
	})
})