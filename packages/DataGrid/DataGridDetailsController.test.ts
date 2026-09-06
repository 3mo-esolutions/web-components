import { html, type HTMLTemplateResult } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type DataGrid } from './index.js'
import { DataGridDetailsController } from './DataGridDetailsController.js'
import type { DataRecord } from './DataRecord.js'

type Data = string

const dataRecords = [
	{ data: 'record1', hasSubData: false, level: 0 },
	{ data: 'record2', hasSubData: false, level: 0 },
	{
		data: 'record3', hasSubData: true, level: 0, subDataRecords: [
			{ data: 'record3-1', hasSubData: true, level: 1 },
			{ data: 'record3-2', hasSubData: false, level: 1 },
		]
	},
	{ data: 'record3-1', hasSubData: true, level: 1 },
	{ data: 'record3-2', hasSubData: false, level: 1 },
] as Array<DataRecord<Data>>

class FakeHost {
	readonly requestUpdate = jasmine.createSpy('requestUpdate')
	readonly updateComplete = Promise.resolve(true)
	addController() { }
	removeController() { }

	constructor(
		readonly hasDefaultRowElements: boolean,
		readonly dataRecords: Array<DataRecord<Data>>,
		public multipleDetails?: boolean,
		readonly getRowDetailsTemplate?: (data: Data) => HTMLTemplateResult,
		readonly hasDataDetail?: (data: Data) => boolean,
	) { }
}

describe('DataGridDetailsController', () => {
	let host: FakeHost
	let controller: DataGridDetailsController<Data>

	const create = (fakeHost: FakeHost) => {
		host = fakeHost
		controller = new DataGridDetailsController<Data>(host)
	}

	beforeEach(() => create(new FakeHost(true, dataRecords, true, data => data === 'record1' ? html`<p>${data}</p>` : html.nothing, data => data === 'record1')))

	describe('hasDetails', () => {
		it('should return true only if there are detailed data', () => {
			expect(controller.hasDetails).toBe(true)

			create(new FakeHost(true, [{ data: 'record2', hasSubData: false }] as Array<DataRecord<Data>>))

			expect(controller.hasDetails).toBe(false)
		})
	})

	describe('hasDetail', () => {
		it('should return true only if record has subData or it is included and has details template', () => {
			expect(controller.hasDetail(host.dataRecords[0]!)).toBe(true)
			expect(controller.hasDetail(host.dataRecords[1]!)).toBe(false)
		})

		it('should return true only if hasDataDetail returns true explicitly if non-default rows are used', () => {
			create(new FakeHost(false, [{ data: 'record1', hasSubData: true }, { data: 'record2', hasSubData: false }] as Array<DataRecord<Data>>, undefined, undefined, data => data === 'record2'))

			expect(controller.hasDetail(host.dataRecords[0]!)).toBe(false)
			expect(controller.hasDetail(host.dataRecords[1]!)).toBe(true)
		})

		it('should evaluate the details template once per record, as it runs application code', () => {
			const getRowDetailsTemplate = jasmine.createSpy('getRowDetailsTemplate').and.returnValue(html`<p></p>`)
			create(new FakeHost(true, dataRecords, true, getRowDetailsTemplate))

			controller.hasDetails
			controller.hasDetail(host.dataRecords[0]!)
			controller.hasDetail(host.dataRecords[0]!)
			controller.areAllOpen

			expect(getRowDetailsTemplate).toHaveBeenCalledTimes(dataRecords.length)
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
			controller.open(host.dataRecords[0]!)

			expect(controller.isOpen(host.dataRecords[0]!)).toBe(true)
			expect(host.requestUpdate).toHaveBeenCalled()
		})

		it('should maintain open parent records if a child record is opened', () => {
			controller.open(host.dataRecords[2]!)
			controller.open(host.dataRecords[3]!)

			expect(controller.isOpen(host.dataRecords[2]!)).toBe(true)
			expect(controller.isOpen(host.dataRecords[3]!)).toBe(true)
			expect(host.requestUpdate).toHaveBeenCalled()
		})

		it('should keep only the parents open when a child record is opened in single mode', () => {
			host.multipleDetails = false
			controller.open(host.dataRecords[0]!)
			controller.open(host.dataRecords[2]!)
			expect(controller.isOpen(host.dataRecords[0]!)).toBe(false)

			controller.open(host.dataRecords[3]!)

			expect(controller.isOpen(host.dataRecords[2]!)).toBe(true)
			expect(controller.isOpen(host.dataRecords[3]!)).toBe(true)
		})

		it('should recognize a record by its data rather than its instance', () => {
			controller.open(host.dataRecords[0]!)

			expect(controller.isOpen({ data: 'record1' } as DataRecord<Data>)).toBe(true)
		})
	})

	describe('openAll', () => {
		it('should reject if multiple details are not supported', () => {
			host.multipleDetails = false

			controller.openAll()

			expect(controller.areAllOpen).toBe(false)
			expect(host.requestUpdate).not.toHaveBeenCalled()
		})

		it('should open all detailed data', () => {
			controller.openAll()

			expect(controller.isOpen(host.dataRecords[0]!)).toBe(true)
			expect(controller.isOpen(host.dataRecords[1]!)).toBe(false)
			expect(host.requestUpdate).toHaveBeenCalled()
		})
	})

	describe('close', () => {
		it('should close detailed data', () => {
			controller.open(host.dataRecords[0]!)
			controller.close(host.dataRecords[0]!)

			expect(controller.isOpen(host.dataRecords[0]!)).toBe(false)
			expect(host.requestUpdate).toHaveBeenCalled()
		})
	})

	describe('closeAll', () => {
		it('should close all detailed data', () => {
			controller.openAll()
			controller.closeAll()
			expect(controller.isOpen(host.dataRecords[0]!)).toBe(false)
			expect(host.requestUpdate).toHaveBeenCalled()
		})
	})

	describe('toggle', () => {
		it('should close detailed data if it is open', () => {
			controller.toggle(host.dataRecords[0]!)
			expect(controller.isOpen(host.dataRecords[0]!)).toBe(true)
			controller.toggle(host.dataRecords[0]!)
			expect(controller.isOpen(host.dataRecords[0]!)).toBe(false)
		})
	})

	describe('toggleAll', () => {
		it('should close all detailed data if they are all open', () => {
			controller.toggleAll()
			expect(controller.areAllOpen).toBe(true)
			controller.toggleAll()
			expect(controller.areAllOpen).toBe(false)
		})

		it('should open all detailed data while only some are open', () => {
			controller.open(host.dataRecords[0]!)

			controller.toggleAll()

			expect(controller.areAllOpen).toBe(true)
		})
	})

	describe('across a data change', () => {
		type Node = { id: number, name: string, children?: Array<Node> }

		const refetched = (): Array<Node> => [
			{ id: 1, name: 'Parent', children: [{ id: 11, name: 'Child', children: [{ id: 111, name: 'Grandchild' }] }] },
			{ id: 2, name: 'Other' },
		]

		const fixture = new ComponentTestFixture<DataGrid<Node>>(html`
			<mo-data-grid multipleDetails subDataGridDataSelector='children' .data=${refetched()}>
				<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			</mo-data-grid>
		`)

		const settle = async () => {
			await fixture.updateComplete
			for (let pass = 0; pass < 3; pass++) {
				for (const row of fixture.component.rows) {
					row.requestUpdate()
					await row.updateComplete
				}
			}
		}

		const details = () => fixture.component.detailsController
		const record = (id: number) => fixture.component.dataRecords.find(dataRecord => dataRecord.data.id === id)!
		const levels = () => fixture.component.rows.map(row => row.level)

		it('should keep a deep row open when the data is replaced by equal but fresh objects', async () => {
			details().open(record(1))
			await settle()
			details().open(record(11))
			await settle()
			expect(levels()).toEqual([0, 1, 2, 0])

			fixture.component.setData(refetched())
			await settle()

			expect(details().isOpen(record(1))).toBe(true)
			expect(details().isOpen(record(11))).toBe(true)
			expect(levels()).toEqual([0, 1, 2, 0])
		})

		it('should hold the open rows as the records of the new data, not the ones it was given them as', async () => {
			details().open(record(1))
			await settle()
			const before = record(1)

			fixture.component.setData(refetched())
			await settle()

			expect(record(1)).not.toBe(before)
			expect(details().expanded).toEqual([record(1)])
		})

		it('should drop a row that the data no longer has', async () => {
			details().open(record(1))
			await settle()

			fixture.component.setData(refetched().filter(node => node.id !== 1))
			await settle()

			expect(details().expanded).toEqual([])
			expect(levels()).toEqual([0])
		})
	})
})