import { Downloader } from '@3mo/downloader'
import type { DataGrid } from './DataGrid.js'

export class CsvGenerator {
	static generate<T>(dataGrid: DataGrid<T, any>) {
		const rows = new Array<Array<string>>()
		const [id, ...headings] = dataGrid.visibleColumns.map(c => c.heading)

		let maxPkTabulation = 0

		const transform = (row: T, pkTabulation = 0) => {
			maxPkTabulation = Math.max(maxPkTabulation, pkTabulation)

			rows.push([
				...Array.from({ length: pkTabulation }).map(() => ''),
				...dataGrid.visibleColumns.map(column => getValueByKeyPath(row, column.dataSelector) as string)
			])

			if (dataGrid.subDataGridDataSelector
					&& dataGrid.subDataGridDataSelector in (row as any)
					&& Array.isArray((row as any)[dataGrid.subDataGridDataSelector])
					&& (row as any)[dataGrid.subDataGridDataSelector]?.length > 0) {
				const children = (row as any)[dataGrid.subDataGridDataSelector] as Array<T>
				children.forEach(child => transform(child, pkTabulation + 1))
			}
		}

		dataGrid.data.map((row) => transform(row))

		rows.unshift([id!, ...Array.from({ length: maxPkTabulation }).map(() => ''), ...headings])

		maxPkTabulation += dataGrid.visibleColumns.length

		const csv = encodeURIComponent(
			rows
				.map(row => {
					const [primaryKey, ...values] = row
					return [
						primaryKey,
						...Array.from({
							length: maxPkTabulation - row.length,
						}).map(() => ''),
						...values,
					].join(',')
				})
				.join('\n')
		)

		// @ts-expect-error manifest can be undefined
		const manifest = globalThis.manifest
		const fileName = (manifest?.short_name ?? '') + 'Export'.replace(/ /g, '_')
		Downloader.download(`data:text/csv;charset=utf-8,${csv}`, `${fileName}.csv`)
	}
}