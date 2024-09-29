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
})