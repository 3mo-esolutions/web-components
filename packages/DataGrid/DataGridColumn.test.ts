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

	describe('stickyEdge', () => {
		const createColumnsWithDataGrid = (...columns: Array<DataGridColumn<Person>>) => {
			const dataGrid = { visibleColumns: columns } as any
			columns.forEach(c => c.dataGrid = dataGrid)
			return columns
		}

		it('should return undefined when column is not sticky', () => {
			const [column] = createColumnsWithDataGrid(new DataGridColumn<Person>({ heading: 'A' }))
			expect(column.stickyEdge).toBeUndefined()
		})

		it('should return undefined when dataGrid is not set', () => {
			const column = new DataGridColumn<Person>({ heading: 'A', sticky: 'start' })
			expect(column.stickyEdge).toBeUndefined()
		})

		it('should return "start end" for sticky="both"', () => {
			const [column] = createColumnsWithDataGrid(new DataGridColumn<Person>({ heading: 'A', sticky: 'both' }))
			expect(column.stickyEdge).toBe('start end')
		})

		it('should return "end" for the last sticky="start" column', () => {
			const [col1, col2, col3] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A', sticky: 'start' }),
				new DataGridColumn<Person>({ heading: 'B', sticky: 'start' }),
				new DataGridColumn<Person>({ heading: 'C' })
			)
			expect(col1.stickyEdge).toBeUndefined()
			expect(col2.stickyEdge).toBe('end')
			expect(col3.stickyEdge).toBeUndefined()
		})

		it('should return "start" for the first sticky="end" column', () => {
			const [col1, col2, col3] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A' }),
				new DataGridColumn<Person>({ heading: 'B', sticky: 'end' }),
				new DataGridColumn<Person>({ heading: 'C', sticky: 'end' })
			)
			expect(col1.stickyEdge).toBeUndefined()
			expect(col2.stickyEdge).toBe('start')
			expect(col3.stickyEdge).toBeUndefined()
		})

		it('should return "end" when there is only one sticky="start" column', () => {
			const [col1, col2] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A', sticky: 'start' }),
				new DataGridColumn<Person>({ heading: 'B' })
			)
			expect(col1.stickyEdge).toBe('end')
			expect(col2.stickyEdge).toBeUndefined()
		})

		it('should return "start" when there is only one sticky="end" column', () => {
			const [col1, col2] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A' }),
				new DataGridColumn<Person>({ heading: 'B', sticky: 'end' })
			)
			expect(col1.stickyEdge).toBeUndefined()
			expect(col2.stickyEdge).toBe('start')
		})
	})
})