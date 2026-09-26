import '@a11d/key-path'
import { type html, type HTMLTemplateResult } from '@a11d/lit'
import { Hierarchy, type HierarchyNode, type HierarchyOptions } from '@3mo/hierarchy'
import { DataRecord } from './DataRecord.js'
import { type DataGridController } from './DataGridController.js'
import { type DataGridColumn } from './DataGridColumn.js'

/** What the records are derived from, besides the sorting. */
export interface DataGridRecordsSource<TData> {
	readonly data: ReadonlyArray<TData>
	readonly subDataGridDataSelector?: KeyPath.Of<TData>
}

export class DataGridRecordsController<TData> {
	constructor(private readonly source: DataGridRecordsSource<TData>, private readonly controller: DataGridController<TData, any>) { }

	private readonly hierarchyOptions: HierarchyOptions<TData> = {
		children: data => this.childrenOf(data),
		sort: (a, b) => this.controller.sorting.compare(a, b),
	}

	private childrenOf(data: TData) {
		const selector = this.source.subDataGridDataSelector
		const subData = !selector ? undefined : KeyPath.get(data, selector)
		return Array.isArray(subData) ? subData as Array<TData> : undefined
	}

	readonly hierarchy = new Hierarchy<TData>(this.hierarchyOptions)

	private cache?: {
		readonly data: ReadonlyArray<TData>
		readonly sorting: unknown
		readonly selector: unknown
		readonly records: Array<DataRecord<TData>>
		readonly byNode: WeakMap<HierarchyNode<TData>, DataRecord<TData>>
	}

	/**
	 * Remembered alongside the records: a column's longest content runs the consumer's template per record.
	 * Per template too, as another column may take the same data's place, as a column element does the one generated before it.
	 */
	private longestContents = new Map<unknown, Map<unknown, HTMLTemplateResult | typeof html.nothing>>()

	get records(): Array<DataRecord<TData>> {
		return this.derive().records
	}

	/** The record rendering a node of the hierarchy. */
	recordOf(node: HierarchyNode<TData>): DataRecord<TData> {
		return this.cache?.byNode.get(node) ?? this.recordFor(node)
	}

	/** Its node's children, or for a record made by hand, the sorted sub data. */
	subRecordsOf(record: DataRecord<TData>): Array<DataRecord<TData>> | undefined {
		if (record.node) {
			return !record.node.children?.length ? undefined : record.node.children.map(child => this.recordOf(child))
		}
		const subData = this.childrenOf(record.data)
		return !subData?.length ? undefined : this.controller.sorting
			.toSortedBy<TData>([...subData], data => data)
			.map(data => new DataRecord(this.controller, { data, level: record.level + 1 }))
	}

	invalidate() {
		this.cache = undefined
		this.longestContents = new Map()
	}

	longestContentOf(column: DataGridColumn<TData>, derive: () => HTMLTemplateResult | typeof html.nothing) {
		this.derive()
		const key = column.dataSelector ?? column
		const byTemplate = this.longestContents.get(key) ?? new Map<unknown, HTMLTemplateResult | typeof html.nothing>()
		this.longestContents.set(key, byTemplate)
		let longest = byTemplate.get(column.getContentTemplate)
		if (longest === undefined) {
			byTemplate.set(column.getContentTemplate, longest = derive())
		}
		return longest
	}

	/** The records of data the grid does not currently hold — a CSV export of a filtered set, say. */
	recordsOf(data: ReadonlyArray<TData>): Array<DataRecord<TData>> {
		if (data === this.source.data) {
			return this.records
		}
		const hierarchy = new Hierarchy<TData>(this.hierarchyOptions)
		hierarchy.roots = data
		return hierarchy.nodes.map(node => this.recordFor(node))
	}

	private derive() {
		const { data, subDataGridDataSelector: selector } = this.source
		const sorting = this.controller.sorting.state
		if (this.cache?.data === data && this.cache.sorting === sorting && this.cache.selector === selector) {
			return this.cache
		}
		this.longestContents = new Map()
		this.hierarchy.roots = data
		this.hierarchy.invalidate()
		const byNode = new WeakMap<HierarchyNode<TData>, DataRecord<TData>>()
		const records = this.hierarchy.nodes.map(node => {
			const record = this.recordFor(node)
			byNode.set(node, record)
			return record
		})
		return this.cache = { data, sorting, selector, records, byNode }
	}

	private recordFor(node: HierarchyNode<TData>) {
		return new DataRecord(this.controller, { data: node.data, index: node.index, level: node.level, node })
	}
}