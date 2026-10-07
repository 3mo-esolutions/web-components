import { equals } from '@a11d/equals'
import { DataGridColumn } from './DataGridColumn.js'
import { DataGridSortingController, DataGridSortingStrategy } from './DataGridSortingController.js'

type Person = { id: number, name: string }

describe('DataGridColumn', () => {
	it('should derive a new column via "with", leaving the original untouched', () => {
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

			;(column1 as any).dataSelector = 'name2'
			expect(column1[equals](column2)).toBe(false)
		})

		it('should default to comparing heading and description if no dataSelector is set', () => {
			const column1 = new DataGridColumn<Person, string>({ heading: 'Name' })
			const column2 = new DataGridColumn<Person, string>({ heading: 'Name' })
			const column3 = new DataGridColumn<Person, string>({ heading: 'Name Changed' })

			expect(column1[equals](column2)).toBe(true)
			expect(column1[equals](column3)).toBe(false)

			;(column2 as any).description = 'Description'
			;(column3 as any).description = 'Description Changed'
			expect(column1[equals](column2)).toBe(false)
			expect(column2[equals](column3)).toBe(false)
			expect(column1[equals](column3)).toBe(false)
		})
	})

	const createController = (...columns: Array<DataGridColumn<Person>>) => {
		const controller = {
			sorting: new DataGridSortingController<Person>(),
			columns: { columns: { modify: vi.fn(), visible: columns } },
		}
		columns.forEach(column => column.controller = controller as any)
		return controller
	}

	describe('sortDataSelector', () => {
		it('should default to the dataSelector when unspecified', () => {
			expect(new DataGridColumn<Person>({ dataSelector: 'name' }).sortDataSelector).toBe('name')
			expect(new DataGridColumn<Person>({ dataSelector: 'name', sortDataSelector: 'id' }).sortDataSelector).toBe('id')
		})
	})

	describe('toggleSort', () => {
		it('should be refused for a non-sortable column', () => {
			const column = new DataGridColumn<Person>({ dataSelector: 'name', sortable: false })
			const controller = createController(column)

			column.toggleSort()

			expect(controller.sorting.get()).toEqual([])
		})

		it('should toggle the sorting of the sortDataSelector, not the dataSelector', () => {
			const column = new DataGridColumn<Person>({ dataSelector: 'name', sortDataSelector: 'id' })
			const controller = createController(column)

			column.toggleSort()

			expect(controller.sorting.get()).toEqual([{ selector: 'id', strategy: DataGridSortingStrategy.Descending, rank: 1 }])
			expect(column.sortingDefinition?.selector).toBe('id')
		})

		it('should reset the sorting when forcing the strategy it already has', () => {
			const column = new DataGridColumn<Person>({ dataSelector: 'name' })
			const controller = createController(column)
			controller.sorting.set({ selector: 'name', strategy: DataGridSortingStrategy.Descending })

			column.toggleSort(DataGridSortingStrategy.Descending)

			expect(controller.sorting.get()).toEqual([])
		})
	})

	describe('toggleSort with modifiers', () => {
		it('should add to the sorting only when the click holds Shift, Ctrl or Meta', () => {
			const name = new DataGridColumn<Person>({ dataSelector: 'name' })
			const id = new DataGridColumn<Person>({ dataSelector: 'id' })
			const controller = createController(name, id)

			name.toggleSort()
			id.toggleSort(undefined, new MouseEvent('click', { ctrlKey: true }))
			expect(controller.sorting.get().map(sorting => sorting.selector)).toEqual(['name', 'id'])

			name.toggleSort(undefined, new MouseEvent('click'))
			expect(controller.sorting.get().map(sorting => sorting.selector)).toEqual(['name'])
		})
	})

	describe('toggleSticky', () => {
		it('should record the stickiness as a modification', () => {
			const column = new DataGridColumn<Person>({ dataSelector: 'name' })
			const controller = createController(column)

			column.toggleSticky('start')

			expect(controller.columns.columns.modify).toHaveBeenCalledExactlyOnceWith('name', { sticky: 'start' })
		})

		it('should pin the column as not sticky (null) when toggling its current stickiness off, so a sticky definition stays overridden', () => {
			const column = new DataGridColumn<Person>({ dataSelector: 'name', sticky: 'start' })
			const controller = createController(column)

			column.toggleSticky('start')

			expect(controller.columns.columns.modify).toHaveBeenCalledExactlyOnceWith('name', { sticky: null })
		})
	})

	describe('stickyEdge', () => {
		const createColumnsWithDataGrid = (...columns: Array<DataGridColumn<Person>>) => {
			const controller = { columns: { columns: { visible: columns } } } as any
			columns.forEach(c => c.controller = controller)
			return columns
		}

		it('should return undefined when column is not sticky', () => {
			const [column] = createColumnsWithDataGrid(new DataGridColumn<Person>({ heading: 'A' }))
			expect(column!.stickyEdge).toBeUndefined()
		})

		it('should return undefined when dataGrid is not set', () => {
			const column = new DataGridColumn<Person>({ heading: 'A', sticky: 'start' })
			expect(column!.stickyEdge).toBeUndefined()
		})

		it('should return "start end" for sticky="both"', () => {
			const [column] = createColumnsWithDataGrid(new DataGridColumn<Person>({ heading: 'A', sticky: 'both' }))
			expect(column!.stickyEdge).toBe('start end')
		})

		it('should return "end" for the last sticky="start" column', () => {
			const [col1, col2, col3] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A', sticky: 'start' }),
				new DataGridColumn<Person>({ heading: 'B', sticky: 'start' }),
				new DataGridColumn<Person>({ heading: 'C' }),
			)
			expect(col1!.stickyEdge).toBeUndefined()
			expect(col2!.stickyEdge).toBe('end')
			expect(col3!.stickyEdge).toBeUndefined()
		})

		it('should return "start" for the first sticky="end" column', () => {
			const [col1, col2, col3] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A' }),
				new DataGridColumn<Person>({ heading: 'B', sticky: 'end' }),
				new DataGridColumn<Person>({ heading: 'C', sticky: 'end' }),
			)
			expect(col1!.stickyEdge).toBeUndefined()
			expect(col2!.stickyEdge).toBe('start')
			expect(col3!.stickyEdge).toBeUndefined()
		})

		it('should return "end" when there is only one sticky="start" column', () => {
			const [col1, col2] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A', sticky: 'start' }),
				new DataGridColumn<Person>({ heading: 'B' }),
			)
			expect(col1!.stickyEdge).toBe('end')
			expect(col2!.stickyEdge).toBeUndefined()
		})

		it('should return "start" when there is only one sticky="end" column', () => {
			const [col1, col2] = createColumnsWithDataGrid(
				new DataGridColumn<Person>({ heading: 'A' }),
				new DataGridColumn<Person>({ heading: 'B', sticky: 'end' }),
			)
			expect(col1!.stickyEdge).toBeUndefined()
			expect(col2!.stickyEdge).toBe('start')
		})
	})
})
