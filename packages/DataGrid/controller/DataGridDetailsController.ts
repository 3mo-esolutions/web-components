import { html } from '@a11d/lit'
import { ExpandabilityController, ExpandabilityAllState, type ExpandabilityControllerOptions } from '@3mo/expandability'
import { type DataRecord } from './DataRecord.js'
import { type DataGridController } from './DataGridController.js'
import { DataGridSelectionController } from './DataGridSelectionController.js'

export class DataGridDetailsController<TData> extends ExpandabilityController<DataRecord<TData>> {
	constructor(private readonly grid: DataGridController<TData>, options?: Pick<ExpandabilityControllerOptions<DataRecord<TData>>, 'indexability'> & { readonly handleChange?: () => void }) {
		super(grid.host, {
			get items() { return controller.detailedRecords },
			key: record => DataGridSelectionController.keyOf(record.data),
			isExpandable: record => controller.hasDetail(record),
			get multiple() { return !!grid.options.multipleDetails },
			ancestorsOf: record => controller.ancestorsOf(record),
			handleChange: () => options?.handleChange?.(),
			indexability: options?.indexability,
		})
		const controller = this
	}

	private memo = { template: undefined as unknown, hasDataDetail: undefined as unknown, answers: new WeakMap<DataRecord<TData>, boolean>(), records: undefined as ReadonlyArray<DataRecord<TData>> | undefined, detailed: new Array<DataRecord<TData>>() }

	get hasDetails() {
		return this.detailedRecords.length > 0
	}

	hasDetail(record: DataRecord<TData>) {
		const { answers } = this.forget()
		let hasDetail = answers.get(record)
		if (hasDetail === undefined) {
			answers.set(record, hasDetail = this.deriveDetail(record))
		}
		return hasDetail
	}

	private get detailedRecords() {
		const memo = this.forget()
		const records = this.grid.records.records
		if (memo.records !== records) {
			memo.records = records
			memo.detailed = records.filter(record => this.hasDetail(record))
		}
		return memo.detailed
	}

	private forget() {
		const { getRowDetailsTemplate, hasDataDetail } = this.grid.options
		if (this.memo.template !== getRowDetailsTemplate || this.memo.hasDataDetail !== hasDataDetail) {
			this.memo = { template: getRowDetailsTemplate, hasDataDetail, answers: new WeakMap(), records: undefined, detailed: [] }
		}
		return this.memo
	}

	private deriveDetail(record: DataRecord<TData>) {
		if (this.grid.options.hasDefaultRowElements === false) {
			// Custom rows are assumed to show their details their own way
			// a row that uses the template nevertheless should also answer `hasDataDetail`.
			return this.grid.options.hasDataDetail?.(record.data) ?? false
		}

		const hasDetailsTemplate = !!this.grid.options.getRowDetailsTemplate && ![undefined, html.nothing].includes(this.grid.options.getRowDetailsTemplate(record.data))
		const included = this.grid.options.hasDataDetail?.(record.data) ?? true
		return record.hasSubData || hasDetailsTemplate && included
	}

	private ancestorsOf(record: DataRecord<TData>): ReadonlyArray<DataRecord<TData>> {
		const ancestors = record.node?.ancestors
		return this.grid.records.records.filter(candidate => ancestors
			? !!candidate.node && ancestors.includes(candidate.node)
			: candidate.subDataRecords?.some(sub => sub.data === record.data))
	}

	get areAllOpen() {
		return this.allState === ExpandabilityAllState.All
	}

	open(record: DataRecord<TData>) {
		return this.expand(record)
	}

	openAll() {
		if (this.grid.options.multipleDetails) {
			this.expandAll()
		}
	}

	close(record: DataRecord<TData>) {
		this.collapse(record)
	}

	closeAll() {
		this.collapseAll()
	}

	override toggleAll() {
		if (this.areAllOpen) {
			this.closeAll()
		} else {
			this.openAll()
		}
	}

	isOpen(record: DataRecord<TData>) {
		return this.isExpanded(record)
	}
}