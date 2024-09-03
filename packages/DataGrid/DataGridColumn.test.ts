import { DataGridColumn } from './DataGridColumn'

type Person = { name: string }

describe('DataGridColumn', () => {
	it('with', () => {
		const column = new DataGridColumn<Person, string>({
			heading: 'Name',
			sortable: true,
			sticky: undefined,
			hidden: true,
			width: 'max-content',
		})

		const columnWithDifferentProperties = column.with({
			heading: 'Name Changed',
			sortable: false,
			sticky: 'end',
			hidden: false,
			width: '100px',
		})

		expect(columnWithDifferentProperties).not.toBe(column)
		expect(columnWithDifferentProperties).toEqual(new DataGridColumn({
			heading: 'Name Changed',
			sortable: false,
			sticky: 'end',
			hidden: false,
			width: '100px',
		}))
	})
})