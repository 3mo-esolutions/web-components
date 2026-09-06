import { html, type HTMLTemplateResult, type ReactiveControllerHost } from '@a11d/lit'
import { ExpandabilityController, ExpandabilityAllState } from '@3mo/expandability'
import { type DataRecord } from './DataRecord.js'
import { DataGridSelectionController } from './DataGridSelectionController.js'

interface DetailedComponent<TData> extends ReactiveControllerHost {
	readonly hasDefaultRowElements: boolean
	readonly dataRecords: Array<DataRecord<TData>>
	readonly getRowDetailsTemplate?: (data: TData) => HTMLTemplateResult
	readonly multipleDetails?: boolean
	readonly hasDataDetail?: (data: TData) => boolean
}

export class DataGridDetailsController<TData> extends ExpandabilityController<DataRecord<TData>, DetailedComponent<TData>> {
	constructor(override readonly host: DetailedComponent<TData>) {
		super(host, {
			get items() { return controller.detailedRecords },
			key: record => DataGridSelectionController.keyOf(record.data),
			isExpandable: record => controller.hasDetail(record),
			get multiple() { return !!host.multipleDetails },
			ancestorsOf: record => controller.ancestorsOf(record),
			stamping: false,
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
		const records = this.host.dataRecords
		if (memo.records !== records) {
			memo.records = records
			memo.detailed = records.filter(record => this.hasDetail(record))
		}
		return memo.detailed
	}

	private forget() {
		const { getRowDetailsTemplate, hasDataDetail } = this.host
		if (this.memo.template !== getRowDetailsTemplate || this.memo.hasDataDetail !== hasDataDetail) {
			this.memo = { template: getRowDetailsTemplate, hasDataDetail, answers: new WeakMap(), records: undefined, detailed: [] }
		}
		return this.memo
	}

	private deriveDetail(record: DataRecord<TData>) {
		if (this.host.hasDefaultRowElements === false) {
			// Custom rows are assumed to show their details their own way
			// a row that uses the template nevertheless should also answer `hasDataDetail`.
			return this.host.hasDataDetail?.(record.data) ?? false
		}

		const hasDetailsTemplate = !!this.host.getRowDetailsTemplate && ![undefined, html.nothing].includes(this.host.getRowDetailsTemplate(record.data))
		const included = this.host.hasDataDetail?.(record.data) ?? true
		return record.hasSubData || hasDetailsTemplate && included
	}

	private ancestorsOf(record: DataRecord<TData>): ReadonlyArray<DataRecord<TData>> {
		const ancestors = record.node?.ancestors
		return this.host.dataRecords.filter(candidate => ancestors
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
		if (this.host.multipleDetails) {
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