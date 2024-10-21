import { Downloader } from '@3mo/downloader'
import type { DataGrid } from './DataGrid.js'

export class CsvGenerator {
	private static readonly itemsPerPage = 1000

	private static fetchAll = async <TData>(
		dataGrid: any,
		didUpdate?: (progress: number) => void
	): Promise<Array<TData>> => {
		if (!('fetch' in dataGrid)) {
			return dataGrid.data
		}

		const values = new Array<TData>()

		const pages = Math.ceil(dataGrid.dataLength / this.itemsPerPage)

		for (let i = 0; i < pages; i++) {
			const data = await dataGrid.fetch({
				...dataGrid.parameters,
				page: i + 1,
				perPage: this.itemsPerPage,
			})
			values.push(...data instanceof Array ? data : data.data)
			didUpdate?.((i + 1) / pages)
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

	static generate = async <TData>(
		dataGrid: DataGrid<TData, any>,
		didUpdate?: (progress: number) => void
	) => {
		const flattenedData = [...dataGrid.flattenData(
			await this.fetchAll(dataGrid, progress => didUpdate?.(progress * 0.5))
		)]

		const progressEntryPoint = 'fetch' in dataGrid ? 0.5 : 0
		const progressScale = 'fetch' in dataGrid ? 0.5 : 1

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
						didUpdate?.(progressEntryPoint + ((i + 1) / array.length) * progressScale)
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