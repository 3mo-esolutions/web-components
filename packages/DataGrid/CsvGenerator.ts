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
				.map(async (_, i) => {
					const values = await dataGrid.fetch({ ...dataGrid.parameters, page: i + 1, perPage: this.itemsPerPage, isBulk: true })
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

	static generate = async <TData>(dataGrid: DataGrid<TData, any>, onProgress: (progress: number) => void) => {
		const flattenedData = [...dataGrid['getFlattenedData'](await this.fetchAll(dataGrid))]

		const maxLevel = Math.max(...flattenedData.map(d => d.level))

		const [firstHeading, ...restHeadings] = dataGrid.visibleColumns
            .flatMap(c => c.formatHeaderAsCsv().map(cell => this.escape(cell)))

		const rows = [
			[firstHeading, ...Array.from({ length: maxLevel }).fill(firstHeading), ...restHeadings],
			...flattenedData.map(d => {
				const nestedPadding = Array.from({ length: d.level }).fill('')
				const childrenPadding = Array.from({ length: maxLevel - d.level }).fill('')
				const [first, ...rest] = dataGrid.visibleColumns
					.flatMap((column, i, array) => {
						onProgress((i + 1) / array.length)
						const value = getValueByKeyPath(d.data, column.dataSelector)
						return column.formatAsCsv(value, d.data).map(cell => this.escape(String(cell)))
          })
				return [
					...nestedPadding,
					first,
					...childrenPadding,
					...rest
				]
			})
		]

		const csv = rows.map(row => row.join(',')).join('\n')

		const now = new Date()

		const fileName = [
			'3MO',
			document.title.split(' | ')[0]?.toLowerCase(),
			`${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`,
		].filter(Boolean).join('_')

		Downloader.download(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`, `${fileName}.csv`)
	}
}