import { type DataGridColumnSticky } from '../index.js'
import type * as CSS from 'csstype'

/**
 * A modification of a data grid's column, keyed by the column's data selector.
 *
 * A modification is a partial spec over whatever column definition is available: it only records
 * intent. A field left `undefined` follows the column's definition; a defined field overrides it.
 * For `sticky`, `null` explicitly pins the column as not sticky, as opposed to `undefined` which
 * follows the definition.
 */
export interface DataGridColumnModification<TData> {
	dataSelector: KeyPath.Of<TData>
	width?: CSS.DataType.TrackBreadth<(string & {}) | 0>
	hidden?: boolean
	sticky?: DataGridColumnSticky | null
}