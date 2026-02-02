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

			expect(mode.parameters!.date).toBeInstanceOf(DateTime)
			expect(mode.parameters!.date).toEqual(new DateTime('2021-01-01T00:00:00.000Z') as any)
		})

		it('should convert date-range objects to DateTimeRange', () => {
			const mode = new ModdableDataGridMode({
				name: 'Test',
				parameters: { dateRange: { start: '2021-01-01T00:00:00.000Z', end: '2021-01-02T00:00:00.000Z' } },
			})

			expect(mode.parameters!.dateRange).toBeInstanceOf(DateTimeRange)
			expect((mode.parameters!.dateRange as unknown as DateTimeRange)!.start).toBeInstanceOf(Date)
			expect((mode.parameters!.dateRange as unknown as DateTimeRange)!.end).toBeInstanceOf(Date)
			expect(mode.parameters!.dateRange).toEqual(new DateTimeRange(new Date('2021-01-01T00:00:00.000Z'), new Date('2021-01-02T00:00:00.000Z')) as any)
		})

		it('should convert json date-ranges to DateTimeRange', () => {
			const mode = new ModdableDataGridMode({
				name: 'Test',
				parameters: { dateRange: '2021-01-01T00:00:00.000Z~2021-01-02T00:00:00.000Z' },
			})

			expect(mode.parameters!.dateRange).toBeInstanceOf(DateTimeRange)
			expect((mode.parameters!.dateRange as unknown as DateTimeRange)!.start).toBeInstanceOf(Date)
			expect((mode.parameters!.dateRange as unknown as DateTimeRange)!.end).toBeInstanceOf(Date)
			expect(mode.parameters!.dateRange).toEqual(new DateTimeRange(new DateTime('2021-01-01T00:00:00.000Z'), new DateTime('2021-01-02T00:00:00.000Z')) as any)
		})
	})

	describe('apply', () => {
		const createDataGridMock = (extractedColumns: Array<any> = []) => ({
			parameters: {},
			extractedColumns,
			setColumns: jasmine.createSpy(),
			sort: jasmine.createSpy(),
			setPagination: jasmine.createSpy(),
			setParameters: jasmine.createSpy().and.callFake(function (this: any, p: any) { this.parameters = p }),
		})

		it('should not set any associated properties by reference', () => {
			const dataGridMock = createDataGridMock()
			const mode = new ModdableDataGridMode({
				name: 'Test',
				parameters: { date: '2021-01-01T00:00:00.000Z' },
			})

			mode.apply(dataGridMock as any)

			expect(dataGridMock.parameters).not.toBe(mode.parameters!)
		})

		it('should apply the mode to the data grid', () => {
			const dataGridMock = createDataGridMock()
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

		it('should apply columns in saved mode order with properties', () => {
			const col1 = { dataSelector: 'col1', width: '100px', hidden: false, sticky: undefined }
			const col2 = { dataSelector: 'col2', width: '200px', hidden: false, sticky: undefined }
			const dataGridMock = createDataGridMock([col1, col2])
			const mode = new ModdableDataGridMode({
				name: 'Modified',
				columns: [
					new ModdableDataGridModeColumn({ dataSelector: 'col2', width: '300px', hidden: true }),
					new ModdableDataGridModeColumn({ dataSelector: 'col1', width: '150px', sticky: 'start' }),
				],
			})

			mode.apply(dataGridMock as any)

			expect(dataGridMock.setColumns).toHaveBeenCalledWith([
				{ dataSelector: 'col2', width: '300px', hidden: true, sticky: undefined },
				{ dataSelector: 'col1', width: '150px', hidden: false, sticky: 'start' },
			])
		})

		it('should ignore columns in mode that do not exist in extractedColumns', () => {
			const col1 = { dataSelector: 'col1', width: undefined, hidden: false, sticky: undefined }
			const dataGridMock = createDataGridMock([col1])
			const mode = new ModdableDataGridMode({
				name: 'WithNonexistent',
				columns: [
					new ModdableDataGridModeColumn({ dataSelector: 'nonexistent' }),
					new ModdableDataGridModeColumn({ dataSelector: 'col1' }),
				],
			})

			mode.apply(dataGridMock as any)

			expect(dataGridMock.setColumns).toHaveBeenCalledWith([col1])
		})

		it('should use extractedColumns when mode has no columns', () => {
			const col1 = { dataSelector: 'col1' }
			const col2 = { dataSelector: 'col2' }
			const dataGridMock = createDataGridMock([col1, col2])
			const mode = new ModdableDataGridMode({ name: 'NoColumns' })

			mode.apply(dataGridMock as any)

			expect(dataGridMock.setColumns).toHaveBeenCalledWith([col1, col2])
		})
	})
})