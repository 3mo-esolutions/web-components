import { equals } from '@a11d/equals'
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

	describe('equals', () => {
		it('should only compare dataSelector if at least one is set', () => {
			const column1 = new DataGridColumn<Person, string>({
				dataSelector: 'name',
				heading: 'Name',
				sortable: true,
				sticky: undefined,
				hidden: true,
				width: 'max-content',
			})

			const column2 = column1.with({
				dataSelector: 'name',
				heading: 'Name Changed',
				sortable: false,
				sticky: 'end',
				hidden: false,
				width: '100px',
			})

			expect(column1[equals](column2)).toBe(true)

			column1.dataSelector = 'name2' as any
			expect(column1[equals](column2)).toBe(false)
		})

		it('should default to comparing heading and description if no dataSelector is set', () => {
			const column1 = new DataGridColumn<Person, string>({ heading: 'Name' })
			const column2 = new DataGridColumn<Person, string>({ heading: 'Name' })
			const column3 = new DataGridColumn<Person, string>({ heading: 'Name Changed' })

			expect(column1[equals](column2)).toBe(true)
			expect(column1[equals](column3)).toBe(false)

			column2.description = 'Description'
			column3.description = 'Description Changed'
			expect(column1[equals](column2)).toBe(false)
			expect(column2[equals](column3)).toBe(false)
			expect(column1[equals](column3)).toBe(false)
		})
	})
})