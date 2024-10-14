import { DataGridSortingStrategy } from '@3mo/data-grid'
import { ModdableDataGridMode, ModdableDataGridModeColumn } from './ModdableDataGridMode'
import { equals } from '@a11d/equals'

describe('ModdableDataGridMode', () => {
	it('should be able to clone', () => {
		const mode = new ModdableDataGridMode({
			name: 'Test',
			columns: [new ModdableDataGridModeColumn({ dataSelector: 'test' })],
			parameters: { parameter1: 'Test', parameter2: 10 },
			sorting: [{ selector: 'test', strategy: DataGridSortingStrategy.Ascending }],
		})

		const clone = mode.clone()

		expect(clone).toEqual(mode)
		expect(Object[equals](clone, mode)).toBe(true)
		expect(clone).not.toBe(mode)
		expect(clone.columns).not.toBe(mode.columns)
		expect(clone.parameters).not.toBe(mode.parameters)
		expect(clone.sorting).not.toBe(mode.sorting)
	})

	it('should not set columns to undefined if not provided', () => {
		const mode = new ModdableDataGridMode({
			name: 'Test',
			parameters: { parameter1: 'Test', parameter2: 10 },
			sorting: [{ selector: 'test', strategy: DataGridSortingStrategy.Ascending }],
		})

		expect(Object.keys(mode)).not.toContain('columns')
	})

	describe('equals', () => {
		const mode1 = new ModdableDataGridMode({
			id: '9b5d0b93-00fc-4384-aef2-4ee2b3aecbd4',
			name: 'Test',
			columns: [new ModdableDataGridModeColumn({ dataSelector: 'test' as 'test' | 'test2' })],
			parameters: { parameter1: 'Test', parameter2: 10 } as any,
			sorting: [{ selector: 'test', strategy: DataGridSortingStrategy.Ascending }],
		})

		const mode2 = new ModdableDataGridMode({
			id: '9b5d0b93-00fc-4384-aef2-4ee2b3aecbd4',
			name: 'Test',
			columns: [new ModdableDataGridModeColumn({ dataSelector: 'test' as 'test' | 'test2' })],
			parameters: { parameter1: 'Test', parameter2: 10 } as any,
			sorting: [{ selector: 'test', strategy: DataGridSortingStrategy.Ascending }],
		})

		it('should return true if equal', () => {
			expect(mode2[equals](mode1)).toBe(true)
			expect(mode2[equals](new ModdableDataGridMode())).toBe(false)
		})

		it('should return false if columns differ', () => {
			const mode3 = mode2.clone()
			mode3.columns![0].dataSelector = 'test2'

			expect(mode3[equals](mode1)).toBe(false)
		})

		it('should ignore falsy differences in parameters', () => {
			const mode3 = mode2.clone()
			mode3.parameters!.parameter3 = ''
			mode3.parameters!.parameter4 = []

			expect(mode3[equals](mode2)).toBe(true)

			mode3.parameters!.parameter5 = false
			expect(mode3[equals](mode2)).toBe(false)
		})
	})

	describe('constructor', () => {
		it('should convert date strings to Date objects', () => {
			const mode = new ModdableDataGridMode({
				name: 'Test',
				parameters: { date: '2021-01-01T00:00:00.000Z' },
			})

			expect(mode.parameters!.date).toBeInstanceOf(Date)
			expect(mode.parameters!.date).toEqual(new Date('2021-01-01T00:00:00.000Z') as any)
		})

		it('should convert date range objects to DateTimeRange objects', () => {
			const mode = new ModdableDataGridMode({
				name: 'Test',
				parameters: { dateRange: { start: '2021-01-01T00:00:00.000Z', end: '2021-01-02T00:00:00.000Z' } },
			})

			expect(mode.parameters!.dateRange).toBeInstanceOf(DateTimeRange)
			expect((mode.parameters!.dateRange as unknown as DateTimeRange)!.start).toBeInstanceOf(Date)
			expect((mode.parameters!.dateRange as unknown as DateTimeRange)!.end).toBeInstanceOf(Date)
			expect(mode.parameters!.dateRange).toEqual(new DateTimeRange(new Date('2021-01-01T00:00:00.000Z'), new Date('2021-01-02T00:00:00.000Z')) as any)
		})
	})

	describe('apply', () => {
		const dataGridMock = new class {
			parameters = {}
			readonly extractedColumns = []
			setColumns = jasmine.createSpy()
			sort = jasmine.createSpy()
			setPagination = jasmine.createSpy()
			setParameters = jasmine.createSpy().and.callFake(p => this.parameters = p)
		}

		it('should not set any associated properties by reference', () => {
			const mode = new ModdableDataGridMode({
				name: 'Test',
				parameters: { date: '2021-01-01T00:00:00.000Z' },
			})

			mode.apply(dataGridMock as any)

			expect(dataGridMock.parameters).not.toBe(mode.parameters!)
		})

		it('should apply the mode to the data grid', () => {
			const mode = new ModdableDataGridMode({
				name: 'Test',
				parameters: { date: '2021-01-01T00:00:00.000Z' },
				sorting: [{ selector: 'test', strategy: DataGridSortingStrategy.Ascending }],
				pagination: 100,
				columns: [new ModdableDataGridModeColumn({ dataSelector: 'test', width: '100px', hidden: true, sticky: 'start' })],
			})

			mode.apply(dataGridMock as any)

			expect(dataGridMock.setParameters).toHaveBeenCalledWith({ date: new Date('2021-01-01') })
			expect(dataGridMock.sort).toHaveBeenCalledWith([{ selector: 'test', strategy: DataGridSortingStrategy.Ascending }])
			expect(dataGridMock.setPagination).toHaveBeenCalledWith(100)
			expect(dataGridMock.setColumns).toHaveBeenCalledWith([])
		})
	})
})