import { html, type HTMLTemplateResult } from '@a11d/lit'
import { type DataRecord } from './index.js'

interface DetailedComponent<TData> {
	readonly hasDefaultRowElements: boolean
	readonly dataRecords: Array<DataRecord<TData>>
	readonly getRowDetailsTemplate?: (data: TData) => HTMLTemplateResult
	readonly multipleDetails?: boolean
	readonly hasDataDetail?: (data: TData) => boolean
	readonly requestUpdate?: () => void
}

export class DataGridDetailsController<TData> {
	private openRecords = new Array<DataRecord<TData>>()

	constructor(readonly host: DetailedComponent<TData>) { }

	private get supportsMultiple() {
		return !!this.host.multipleDetails
	}

	get hasDetails() {
		return this.detailedData.length > 0
	}

	private get detailedData() {
		return this.host.dataRecords.filter(data => this.hasDetail(data))
	}

	hasDetail(record: DataRecord<TData>) {
		if (this.host.hasDefaultRowElements === false) {
			// We make the assumption that custom rows don't use
			// the `getRowDetailsTemplate` and implement their own way of showing details.
			// If they do use it, they should also override `hasDataDetail`
			// to return false for the records that don't have details.
			return this.host.hasDataDetail?.(record.data) ?? false
		}

		const hasDetailsTemplate = !!this.host.getRowDetailsTemplate && ![undefined, html.nothing].includes(this.host.getRowDetailsTemplate(record.data))
		const included = this.host.hasDataDetail?.(record.data) ?? true
		return record.hasSubData || hasDetailsTemplate && included
	}

	get areAllOpen() {
		return this.openRecords.length === this.detailedData.length
	}

	open(record: DataRecord<TData>) {
		if (this.hasDetail(record)) {
			this.openRecords = [
				...this.supportsMultiple
					? this.openRecords
					: this.openRecords.filter(r => r.subDataRecords?.some(subRecord => subRecord.data === record.data)),
				record
			]
			this.host.requestUpdate?.()
		}
	}

	openAll() {
		if (this.supportsMultiple) {
			this.openRecords = this.detailedData
			this.host.requestUpdate?.()
		}
	}

	close(record: DataRecord<TData>) {
		this.openRecords = this.openRecords.filter(r => r.data !== record.data)
		this.host.requestUpdate?.()
	}

	closeAll() {
		this.openRecords = []
		this.host.requestUpdate?.()
	}

	toggle(data: DataRecord<TData>) {
		if (this.isOpen(data)) {
			this.close(data)
		} else {
			this.open(data)
		}
	}

	toggleAll() {
		if (this.areAllOpen) {
			this.closeAll()
		} else {
			this.openAll()
		}
	}

	isOpen(record: DataRecord<TData>) {
		return this.openRecords.map(r => r.data).includes(record.data)
	}
}