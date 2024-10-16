import { html } from '@a11d/lit'
import { DataGridDetailsController } from './DataGridDetailsController'
import type { DataRecord } from './DataRecord'

type Data = string

describe('DataGridDetailsController', () => {
	let controller: DataGridDetailsController<any>

	beforeEach(() =>
		controller = new DataGridDetailsController<Data>({
			hasDefaultRowElements: true,
			dataRecords: [{ data: 'record1', hasSubData: true }, { data: 'record2', hasSubData: false }] as Array<DataRecord<Data>>,
			getRowDetailsTemplate: data => data === 'record1' ? html`<p>${data}</p>` : html.nothing,
			multipleDetails: true,
			hasDataDetail: data => data === 'record1',
			requestUpdate: jasmine.createSpy('requestUpdate')
		})
	)

	describe('hasDetails', () => {
		it('should return true only if there are detailed data', () => {
			expect(controller.hasDetails).toBe(true)

			controller = new DataGridDetailsController<Data>({
				hasDefaultRowElements: true,
				dataRecords: [{ data: 'record2', hasSubData: false }] as Array<DataRecord<Data>>,
			})

			expect(controller.hasDetails).toBe(false)
		})
	})

	describe('hasDetail', () => {
		it('should return true only if record has subData or it is included and has details template', () => {
			expect(controller.hasDetail(controller.host.dataRecords[0])).toBe(true)
			expect(controller.hasDetail(controller.host.dataRecords[1])).toBe(false)
		})

		it('should return true only if hasDataDetail returns true explicitly if non-default rows are used', () => {
			controller = new DataGridDetailsController<Data>({
				hasDefaultRowElements: false,
				dataRecords: [{ data: 'record1', hasSubData: true }, { data: 'record2', hasSubData: false }] as Array<DataRecord<Data>>,
				hasDataDetail: data => data === 'record2',
			})

			expect(controller.hasDetail(controller.host.dataRecords[0])).toBe(false)
			expect(controller.hasDetail(controller.host.dataRecords[1])).toBe(true)
		})
	})

	describe('areAllOpen', () => {
		it('should return true only if all detailed data are open', () => {
			expect(controller.areAllOpen).toBe(false)

			controller.openAll()

			expect(controller.areAllOpen).toBe(true)
		})
	})

	describe('open', () => {
		it('should open detailed data', () => {
			controller.open(controller.host.dataRecords[0])

			expect(controller.isOpen(controller.host.dataRecords[0])).toBe(true)
			expect(controller.host.requestUpdate).toHaveBeenCalled()
		})
	})

	describe('openAll', () => {
		it('should reject if multiple details are not supported', () => {
			(controller.host as any).multipleDetails = false

			controller.openAll()

			expect(controller.areAllOpen).toBe(false)
			expect(controller.host.requestUpdate).not.toHaveBeenCalled()
		})

		it('should open all detailed data', () => {
			controller.openAll()

			expect(controller.isOpen(controller.host.dataRecords[0])).toBe(true)
			expect(controller.isOpen(controller.host.dataRecords[1])).toBe(false)
			expect(controller.host.requestUpdate).toHaveBeenCalled()
		})
	})

	describe('close', () => {
		it('should close detailed data', () => {
			controller.open(controller.host.dataRecords[0])
			controller.close(controller.host.dataRecords[0])

			expect(controller.isOpen(controller.host.dataRecords[0])).toBe(false)
			expect(controller.host.requestUpdate).toHaveBeenCalled()
		})
	})

	describe('closeAll', () => {
		it('should close all detailed data', () => {
			controller.openAll()
			controller.closeAll()
			expect(controller.isOpen(controller.host.dataRecords[0])).toBe(false)
			expect(controller.host.requestUpdate).toHaveBeenCalled()
		})
	})

	describe('toggle', () => {
		it('should close detailed data if it is open', () => {
			controller.toggle(controller.host.dataRecords[0])
			expect(controller.isOpen(controller.host.dataRecords[0])).toBe(true)
			controller.toggle(controller.host.dataRecords[0])
			expect(controller.isOpen(controller.host.dataRecords[0])).toBe(false)
		})
	})

	describe('toggleAll', () => {
		it('should close all detailed data if they are all open', () => {
			controller.toggleAll()
			expect(controller.areAllOpen).toBe(true)
			controller.toggleAll()
			expect(controller.areAllOpen).toBe(false)
		})
	})
})