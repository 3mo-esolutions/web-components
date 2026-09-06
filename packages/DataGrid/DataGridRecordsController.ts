import { type html, type HTMLTemplateResult } from '@a11d/lit'
import { Hierarchy, type HierarchyNode, type HierarchyOptions } from '@3mo/hierarchy'
import { DataRecord } from './DataRecord.js'
import { type DataGrid } from './DataGrid.js'

export class DataGridRecordsController<TData> {
	constructor(private readonly host: DataGrid<TData, any>) { }

	private readonly hierarchyOptions: HierarchyOptions<TData> = {
		children: data => {
			const selector = this.host.subDataGridDataSelector
			const subData = !selector ? undefined : KeyPath.get(data, selector)
			return Array.isArray(subData) ? subData : undefined
		},
		sort: (a, b) => this.host.sortingController.compare(a, b),
	}

	readonly hierarchy = new Hierarchy<TData>(this.hierarchyOptions)

	private cache?: {
		readonly data: ReadonlyArray<TData>
		readonly sorting: unknown
		readonly selector: unknown
		readonly records: Array<DataRecord<TData>>
		readonly byNode: WeakMap<HierarchyNode<TData>, DataRecord<TData>>
	}

	/** Remembered alongside the records: a column's longest content runs the consumer's template per record. */
	private longestContents = new Map<unknown, HTMLTemplateResult | typeof html.nothing>()

	get records(): Array<DataRecord<TData>> {
		return this.derive().records
	}

	/** The record rendering a node of the hierarchy. */
	recordOf(node: HierarchyNode<TData>): DataRecord<TData> {
		return this.cache?.byNode.get(node) ?? this.recordFor(node)
	}

	invalidate() {
		this.cache = undefined
		this.longestContents = new Map()
	}

	longestContentOf(key: unknown, derive: () => HTMLTemplateResult | typeof html.nothing) {
		this.derive()
		let longest = this.longestContents.get(key)
		if (longest === undefined) {
			this.longestContents.set(key, longest = derive())
		}
		return longest
	}

	/** The records of data the grid does not currently hold — a CSV export of a filtered set, say. */
	recordsOf(data: ReadonlyArray<TData>): Array<DataRecord<TData>> {
		if (data === this.host.data) {
			return this.records
		}
		const hierarchy = new Hierarchy<TData>(this.hierarchyOptions)
		hierarchy.roots = data
		return hierarchy.nodes.map(node => this.recordFor(node))
	}

	private derive() {
		const { data, sorting, subDataGridDataSelector: selector } = this.host
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
		return new DataRecord(this.host, { data: node.data, index: node.index, level: node.level, node })
	}
}