import { type DataGridColumn } from '../index.js'
import { ArrayLikeView } from './ArrayLikeView.js'
import { DataGridColumnDefinitions } from './DataGridColumnDefinitions.js'
import { DataGridColumnModifications } from './DataGridColumnModifications.js'
import { type DataGridColumnModification } from './DataGridColumnModification.js'

type DataGridColumnsInit<TData> = {
	/** Generates definitions from the data grid's data. Only called while no other definition source provides any. */
	readonly generate?: () => ReadonlyArray<DataGridColumn<TData>>
	/** Called for each composed column, so that the data grid can attach itself to it */
	readonly prepare?: (column: DataGridColumn<TData>) => void
	/** Called whenever the columns have been composed anew */
	readonly updated?: () => void
}

/**
 * The columns of a data grid, composed as `columns = modifications ⊗ definitions`:
 *
 * - `definitions` — which columns exist and how they present by default. @see DataGridColumnDefinitions
 * - `modifications` — the intent about their order and presentation. @see DataGridColumnModifications
 *
 * The columns are composed by applying the modifications onto the definitions they know, in their
 * order, followed by the definitions no modification mentions. Modifications without a definition —
 * e.g. of a saved view's column whose element has not rendered yet — are skipped while kept, so
 * they take effect as soon as their definition appears.
 *
 * The object *is* its composed columns, being iterable and array-like. Both layers stay separately
 * owned, so a definition change can never overwrite an expressed intent and vice versa. Columns are
 * composed anew whenever either layer changes, so they are never stale and never stored twice.
 */
export class DataGridColumns<TData> extends ArrayLikeView<DataGridColumn<TData>> {
	readonly definitions: DataGridColumnDefinitions<TData>
	readonly modifications: DataGridColumnModifications<TData>

	constructor(private readonly init?: DataGridColumnsInit<TData>) {
		super()
		this.definitions = new DataGridColumnDefinitions<TData>({
			generate: () => this.init?.generate?.() ?? [],
			updated: () => this.layerUpdated(),
		})
		this.modifications = new DataGridColumnModifications<TData>({
			updated: () => this.layerUpdated(),
		})
		this.compose()
	}

	get visible() {
		return this.filter(column => column.hidden === false)
	}

	get(dataSelector: KeyPath.Of<TData>) {
		return this.find(column => column.dataSelector === dataSelector)
	}

	/** Modifies the column of the given data selector, keeping the modifications of all other columns */
	modify(dataSelector: KeyPath.Of<TData>, modification: Partial<Omit<DataGridColumnModification<TData>, 'dataSelector'>>) {
		const modifications = this.materializedModifications
		const existing = modifications.find(m => m.dataSelector === dataSelector)
		existing ? Object.assign(existing, modification) : modifications.push({ dataSelector, ...modification })
		this.modifications.set(modifications)
	}

	/** Moves the column of the given data selector to the given index */
	move(dataSelector: KeyPath.Of<TData>, index: number) {
		const modifications = this.materializedModifications
		const fromIndex = modifications.findIndex(m => m.dataSelector === dataSelector)
		if (fromIndex === -1) {
			return
		}
		const [modification] = modifications.splice(fromIndex, 1)
		modifications.splice(index, 0, modification!)
		this.modifications.set(modifications)
	}

	/** Composes the columns and their definitions anew, e.g. after the data grid's data changed */
	update() {
		// Cascades back through the definitions' update notification, which composes the columns anew
		this.definitions.update()
	}

	private layerUpdated() {
		this.compose()
		this.init?.updated?.()
	}

	private compose() {
		const columns = [
			...this.modifications
				.map(modification => {
					const definition = this.definitions.get(modification.dataSelector)
					return definition?.with({
						width: modification.width ?? definition.width,
						hidden: modification.hidden ?? definition.hidden,
						sticky: modification.sticky === undefined ? definition.sticky : modification.sticky ?? undefined,
					})
				})
				.filter(column => column !== undefined),
			...this.definitions.filter(definition => !this.modifications.get(definition.dataSelector)),
		]
		columns.forEach(column => this.init?.prepare?.(column))
		this.setItems(columns)
	}

	/**
	 * The modifications expanded to cover every current column, as expressing intent about one column
	 * implies intent about the order of all of them. Modifications without a current column are kept
	 * at the end, so intent about a column whose definition has not appeared yet is not lost.
	 */
	private get materializedModifications() {
		return [
			...this.map(column => this.modifications.get(column.dataSelector) ?? { dataSelector: column.dataSelector }),
			...this.modifications.filter(modification => !this.get(modification.dataSelector)),
		]
	}
}