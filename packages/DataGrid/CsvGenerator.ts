import { Downloader } from '@3mo/downloader'
import type { DataGrid } from './DataGrid.js'

export class CsvGenerator {
	private static readonly itemsPerPage = 1000

	private static fetchAll = async <TData>(dataGrid: any): Promise<Array<TData>> => {
		if (!('fetch' in dataGrid)) {
			return dataGrid.data
		}

		const values = new Array<TData>()

		for (let i = 0; i < Math.ceil(dataGrid.dataLength / this.itemsPerPage); i++) {
			const data = await dataGrid.fetch({
				...dataGrid.parameters,
				page: i + 1,
				perPage: this.itemsPerPage,
			})
			values.push(...data instanceof Array ? data : data.data)
		}

		return values
	}

	private static sanitize = (value: string) => {
		if (typeof value !== 'string') {
			value = String(value)
		}

		if (value.includes(',')) {
			value = `"${value.replaceAll('"', '""')}"`
		}

		return value
	}

	static generate = async <TData>(dataGrid: DataGrid<TData, any>, changed: (progress: number) => void) => {
		const flattenedData = [...dataGrid.flattenData(await this.fetchAll(dataGrid))]

		const maxLevel = Math.max(...flattenedData.map(d => d.level))

		const [firstHeading, ...restHeadings] = dataGrid.visibleColumns
    	.flatMap(c => {
				const formattedOrVoid = c.formatHeaderForCsv?.()
				return formattedOrVoid === undefined ? [] : new Array<string>().concat(formattedOrVoid).map(this.sanitize)
			})

		const rows = [
			[firstHeading, ...Array.from({ length: maxLevel }).fill(firstHeading), ...restHeadings],
			...flattenedData.map(d => {
				const nestedPadding = Array.from({ length: d.level }).fill('')
				const childrenPadding = Array.from({ length: maxLevel - d.level }).fill('')
				const [first, ...rest] = dataGrid.visibleColumns
					.flatMap((column, i, array) => {
						changed((i + 1) / array.length)
						const value = getValueByKeyPath(d.data, column.dataSelector)
						const formattedOrVoid = column.formatValueForCsv?.(value, d.data)
						return formattedOrVoid === undefined ? [] : new Array<string>().concat(formattedOrVoid).map(this.sanitize)
          })
				return [
					...nestedPadding,
					first,
					...childrenPadding,
					...rest
				]
			})
		]

		const formatted = rows.map(row => row.join(',')).join('\n')

		const fileName = [
			'3MO',
			document.title.split(' | ')[0]?.toLowerCase(),
			new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14),
		].filter(Boolean).join('_')

		Downloader.download(`data:text/csv;charset=utf-8,${encodeURIComponent(formatted)}`, `${fileName}.csv`)
	}
}