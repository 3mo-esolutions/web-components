import { DataGridColumn } from './DataGridColumn.js'
import { DataGridCsvController } from './DataGridCsvController.js'
import { DataRecord } from './DataRecord.js'
import '../index.js'

type Person = { id: number, name: string, age: number, birthDate: DateTime }

describe('DataGridCsvController', () => {
	let controller: DataGridCsvController<Person>
	const requestUpdate = vi.fn()
	const handleCsv = vi.fn()

	let csvData: Array<DataRecord<Person>>

	beforeEach(() => {
		csvData = [
			new DataRecord(undefined!, { data: { name: 'John', age: 30, birthDate: new DateTime('1990-01-01') } as Person, index: 0, level: 0 }),
			new DataRecord(undefined!, { data: { name: 'Jane', age: 25, birthDate: new DateTime('1991-01-01') } as Person, index: 1, level: 0 }),
			new DataRecord(undefined!, { data: { name: 'John', age: 30, birthDate: new DateTime('1992-01-01') } as Person, index: 2, level: 0 }),
		]
		const visible = [
			new DataGridColumn<Person, string>({
				dataSelector: 'name',
				*generateCsvHeading() { yield 'Name' },
				*generateCsvValue(value, data) {
					data
					yield value
				},
			}),
			new DataGridColumn<Person, number>({
				dataSelector: 'age',
				*generateCsvHeading() { yield 'Age' },
				*generateCsvValue(value, data) {
					data
					yield value.toString()
				},
			}),
			new DataGridColumn<Person, DateTime>({
				dataSelector: 'birthDate',
				*generateCsvHeading() { yield 'Birth Date' },
				*generateCsvValue(value, data) {
					data
					yield value.toISOString().split('T')[0]!
				},
			}),
		]
		// Stands in for the grid's controller: the export only ever asks it for these.
		controller = new DataGridCsvController<Person>({
			host: { requestUpdate },
			options: {
				handleCsv,
				async *getCsvData() {
					yield 1
					return csvData
				},
			},
			columns: { columns: { visible } },
		} as any)
	})

	describe('sanitize', () => {
		it('should stringify the input if it is not a string', () => {
			expect(DataGridCsvController.sanitize(t('Currency'))).toBe('Currency')
		})

		it('should escape commas', () => {
			expect(DataGridCsvController.sanitize('a,b')).toBe('"a,b"')
		})
	})

	describe('generateCsv', () => {
		it('should generate csv from data', async () => {
			await controller.generateCsv()

			expect(handleCsv).toHaveBeenCalledWith('Name,Age,Birth Date\nJohn,30,1990-01-01\nJane,25,1991-01-01\nJohn,30,1992-01-01')
		})

		it('should be able to handle nested data', async () => {
			csvData[1] = new DataRecord(undefined!, { data: { name: 'Jane', age: 25, birthDate: new DateTime('1991-01-01') } as Person, index: 1, level: 1 })

			await controller.generateCsv()

			expect(handleCsv).toHaveBeenCalledWith('Name,Name,Age,Birth Date\nJohn,,30,1990-01-01\n,Jane,25,1991-01-01\nJohn,,30,1992-01-01')
		})
	})
})
