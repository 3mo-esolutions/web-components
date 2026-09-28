import { ArrayLikeView } from './ArrayLikeView.js'
import { type DataGridColumnModification } from './DataGridColumnModification.js'

type DataGridColumnModificationsInit = {
	/** Called whenever the modifications changed */
	readonly updated?: () => void
}

/**
 * The column modifications of a data grid: the user's or a saved view's intent about column order,
 * width, visibility and stickiness. @see DataGridColumnModification
 *
 * They are partial and ordered: columns they do not mention follow their definitions and are
 * appended after the modified ones. Being empty means no intent is expressed at all, which is the
 * state of a data grid whose columns nobody has arranged yet.
 *
 * @see DataGridColumns for expressing intent about a data grid's columns, which is what modifies these.
 */
export class DataGridColumnModifications<TData> extends ArrayLikeView<DataGridColumnModification<TData>> {
	constructor(private readonly init?: DataGridColumnModificationsInit) {
		super()
	}

	get(dataSelector: KeyPath.Of<TData>) {
		return this.find(modification => modification.dataSelector === dataSelector)
	}

	/** Replaces all modifications, clearing them if none are given */
	set(modifications?: Iterable<DataGridColumnModification<TData>>) {
		this.setItems([...modifications ?? []])
		this.init?.updated?.()
	}
}