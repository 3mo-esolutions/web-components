import { type DataGridColumn } from '../index.js'
import { ArrayLikeView } from './ArrayLikeView.js'

type DataGridColumnDefinitionsInit<TData> = {
	/** Generates definitions from the data grid's data. Only called while no other source provides any definitions. */
	readonly generate?: () => ReadonlyArray<DataGridColumn<TData>>
	/** Called whenever a source changed and the effective definitions have been composed anew */
	readonly updated?: () => void
}

/**
 * The column definitions of a data grid: which columns exist and how they present by default.
 *
 * Definitions originate from three sources whose precedence this class owns: the first source
 * providing any definitions wins — `extracted` before `programmatic` before `generated`. Assigning
 * a source composes the effective definitions anew.
 *
 * The object *is* its effective definitions, being iterable and array-like, while each source stays
 * individually accessible.
 */
export class DataGridColumnDefinitions<TData> extends ArrayLikeView<DataGridColumn<TData>> {
	private _extracted = new Array<DataGridColumn<TData>>()
	/** Definitions extracted from the data grid's column elements */
	get extracted() { return this._extracted as ReadonlyArray<DataGridColumn<TData>> }
	set extracted(value) {
		this._extracted = [...value]
		this.update()
	}

	private _programmatic = new Array<DataGridColumn<TData>>()
	/** Definitions provided programmatically through the data grid's `columns` property */
	get programmatic() { return this._programmatic as ReadonlyArray<DataGridColumn<TData>> }
	set programmatic(value) {
		this._programmatic = [...value]
		this.update()
	}

	private _generated: ReadonlyArray<DataGridColumn<TData>> = []
	/** Definitions generated from the data grid's data, being empty while another source provides definitions */
	get generated() { return this._generated }

	constructor(private readonly init?: DataGridColumnDefinitionsInit<TData>) {
		super()
		this.compose()
	}

	get(dataSelector: KeyPath.Of<TData>) {
		return this.find(definition => definition.dataSelector === dataSelector)
	}

	/** Composes the definitions anew from the current sources, e.g. after the data grid's data changed */
	update() {
		this.compose()
		this.init?.updated?.()
	}

	private compose() {
		this._generated = this._extracted.length || this._programmatic.length ? [] : this.init?.generate?.() ?? []
		this.setItems([this._extracted, this._programmatic, this._generated].find(source => source.length > 0) ?? [])
	}
}