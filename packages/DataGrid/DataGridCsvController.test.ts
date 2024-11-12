import { DataGridCsvController } from './DataGridCsvController'

type Data = {}

describe('DataGridCsvController', () => {
	let controller: DataGridCsvController<Data>

	beforeEach(() =>
		controller = new DataGridCsvController<Data>({

			// hasDefaultRowElements: true,
			// dataRecords: [{ data: 'record1', hasSubData: true }, { data: 'record2', hasSubData: false }] as Array<DataRecord<Data>>,
			// getRowDetailsTemplate: data => data === 'record1' ? html`<p>${data}</p>` : html.nothing,
			// multipleDetails: true,
			// hasDataDetail: data => data === 'record1',
			// requestUpdate: jasmine.createSpy('requestUpdate')
		})
	)

	describe('sanitize', () => {
		it('should stringify the input if it is not a string', () => {
			expect(DataGridCsvController.sanitize(t('Currency'))).toBe('Currency')
		})

		it('should escape commas', () => {
			expect(DataGridCsvController.sanitize('a,b')).toBe('"a,b"')
		})
	})

	describe('hasDetails', () => {
		it('should return true only if there are detailed data', () => {
		})
	})
})