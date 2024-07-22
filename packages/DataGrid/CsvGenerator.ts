import { Downloader } from '@3mo/downloader'
import type { DataGrid } from './DataGrid.js'

export class CsvGenerator {
	private static readonly itemsPerPage = 1000

	static fetchAll = async <TData>(dataGrid: any): Promise<Array<TData>> => {
		if (!('fetch' in dataGrid)) {
			return dataGrid.data
		}

		const values = await Promise.all(
			Array
				.from({ length: Math.ceil(dataGrid.dataLength / this.itemsPerPage) })
				.map((_, page) => {
					const values =  dataGrid.fetch({ ...dataGrid.parameters, page: page + 1, perPage: this.itemsPerPage, isBulk: 1 })
					return values instanceof Array ? values : values.data
				})
		)

		return values.flat()
}

	static escape = (value: string) => {
		if (value.includes(',')) {
			if (value.includes('"')) {
				value = value.replaceAll('"', '""')
			}
			value = `"${value}"`
		}

		return value
	}

	static generate = async <TData>(dataGrid: DataGrid<TData, any>) => {
		const flattenedData = [...dataGrid['getFlattenedData'](await CsvGenerator.fetchAll<TData>(dataGrid))]

		const maxLevel = Math.max(...flattenedData.map(d => d.level))

		const [firstHeading, ...restHeadings] = dataGrid.visibleColumns.map(c =>
			`${this.escape(c.heading.length < 3 && c.description ? c.description : c.heading)}${!c.suffix ? '' : ` ${c.suffix}`}`)

		const rows = [
			[firstHeading!, ...Array.from({ length: maxLevel }).fill(firstHeading), ...restHeadings],
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