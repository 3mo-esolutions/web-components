import { html, type HTMLTemplateResult } from '@a11d/lit'
import { type DataRecord } from './index.js'

interface DetailedComponent<TData> {
	readonly dataRecords: Array<DataRecord<TData>>
	readonly getRowDetailsTemplate?: (data: TData) => HTMLTemplateResult
	readonly multipleDetails?: boolean
	readonly hasDataDetail?: (data: TData) => boolean
	readonly requestUpdate?: () => void
}

export class DataGridDetailsController<TData> {
	private openData = new Array<TData>()

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
		const hasDetailsTemplate = !!this.host.getRowDetailsTemplate && ![undefined, html.nothing].includes(this.host.getRowDetailsTemplate?.(record.data))
		const included = this.host.hasDataDetail?.(record.data) ?? true
		return record.hasSubData || hasDetailsTemplate && included
	}

	get areAllOpen() {
		return this.openData.length === this.detailedData.length
	}

	open(record: DataRecord<TData>) {
		if (this.hasDetail(record)) {
			this.openData = this.supportsMultiple ? [...this.openData, record.data] : [record.data]
			this.host.requestUpdate?.()
		}
	}

	openAll() {
		if (this.supportsMultiple) {
			this.openData = this.detailedData.map(d => d.data)
			this.host.requestUpdate?.()
		}
	}

	close(record: DataRecord<TData>) {
		this.openData = this.openData.filter(data => data !== record.data)
		this.host.requestUpdate?.()
	}

	closeAll() {
		this.openData = []
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
		return this.openData.includes(record.data)
	}
}