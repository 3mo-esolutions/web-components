import { Downloader } from '@3mo/downloader'
import type { DataGrid } from './DataGrid.js'

export class CsvGenerator {
	static escape = (value: string) => {
		if (value.includes(',')) {
			if (value.includes('"')) {
				value = value.replaceAll('"', '""')
			}
			value = `"${value}"`
		}

		return value
	}

	static generate<TData>(dataGrid: DataGrid<TData, any>) {
		const flattenedData = [...dataGrid['getFlattenedData']()]
		const maxLevel = Math.max(...flattenedData.map(d => d.level))

		const [firstHeading, ...restHeadings] = dataGrid.visibleColumns.map(c =>
			this.escape(c.heading.length < 3 && c.description ? c.description : c.heading))

		const rows = [
			[firstHeading!, ...Array.from({ length: maxLevel }).fill(''), ...restHeadings],
			...flattenedData.map(d => {
				const nestedPadding = Array.from({ length: d.level }).fill('')
				const childrenPadding = Array.from({ length: maxLevel - d.level }).fill('')
				const [first, ...rest] = dataGrid.visibleColumns
					.flatMap(column => this.escape(String(column.format(getValueByKeyPath(d.data, column.dataSelector), d.data))))
				return [
					...nestedPadding,
					first,
					...childrenPadding,
					...rest
				]
			})
		]

		const csv = rows.map(row => row.join(',')).join('\n')

		// @ts-expect-error manifest can be undefined
		const fileName = (globalThis.manifest?.short_name ?? '') + 'Export'.replace(/ /g, '_')
		Downloader.download(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`, `${fileName}.csv`)
	}
}