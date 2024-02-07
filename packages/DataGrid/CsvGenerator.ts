import { Downloader } from '@3mo/downloader'
import type { DataGrid } from './DataGrid.js'

export class CsvGenerator {
	static generate<TData>(dataGrid: DataGrid<TData>) {
		const csv = [
			dataGrid.visibleColumns.map(c => c.heading),
			...dataGrid.data.map(data => dataGrid.visibleColumns.map(c => getValueByKeyPath(data, c.dataSelector)?.toString() ?? '').join(',')),
		].join('\n')

		// @ts-expect-error manifest can be undefined
		const manifest = globalThis.manifest
		const fileName = (manifest?.short_name ?? '') + 'Export'.replace(/ /g, '_')
		Downloader.download(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`, `${fileName}.csv`)
	}
}