import { Downloader } from '@3mo/downloader'
import { type DataRecord } from './DataRecord.js'
import { type DataGridColumn } from './DataGridColumn.js'
import { NotificationComponent } from '@a11d/lit-application'

interface Host<TData> {
	/**
	 * Gets the entire data set to be exported as CSV.
	 * This can yield numbers in between to indicate progress for large data sets.
	 */
	getCsvData(): AsyncGenerator<number, Array<DataRecord<TData>>>
	get visibleColumns(): Array<DataGridColumn<TData>>
	requestUpdate(): void
}

export class DataGridCsvController<TData> {
	static sanitize(value: string) {
		if (typeof value !== 'string') {
			value = String(value)
		}

		if (value.includes(',')) {
			value = `"${value.replaceAll('"', '""')}"`
		}

		return value
	}

	static async download(data: string) {
		const fileName = [
			document.title.split(' | ')[0],
			new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14),
		].filter(Boolean).join('_')

		Downloader.download(`data:text/csv;charset=utf-8,${encodeURIComponent(data)}`, `${fileName}.csv`)

		await new Promise(r => setTimeout(r, 1000))
	}

	constructor(protected readonly host: Host<TData>) { }

	private _progress?: number
	get generationProgress() { return this._progress }
	private set generationProgress(value: number | undefined) {
		this._progress = value
		this.host.requestUpdate()
	}

	get isGenerating() { return this._progress !== undefined }

	async generateCsv() {
		if (this.isGenerating) {
			return
		}

		this.generationProgress = 0

		try {
			const dataRecords = new Array<DataRecord<TData>>()

			const asyncIterator = this.host.getCsvData()
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const { done, value } = await asyncIterator.next()
				if (done) {
					dataRecords.push(...value)
					break
				}
				this.generationProgress = value
			}

			const maxLevel = Math.max(...dataRecords.map(d => d.level))

			const [firstHeading, ...otherHeadings] = this.host.visibleColumns.flatMap(c => [...c.generateCsvHeading?.() ?? []].map(DataGridCsvController.sanitize))

			const rows = [
				[firstHeading, ...Array.from({ length: maxLevel }).fill(firstHeading), ...otherHeadings],
				...dataRecords.map(d => {
					const nestedPadding = Array.from({ length: d.level }).fill('')
					const childrenPadding = Array.from({ length: maxLevel - d.level }).fill('')
					const [first, ...rest] = this.host.visibleColumns
						.flatMap(column => {
							const value = KeyPath.get(d.data, column.dataSelector)
							return [...column.generateCsvValue?.(value, d.data) ?? []].map(DataGridCsvController.sanitize)
						})
					return [
						...nestedPadding,
						first,
						...childrenPadding,
						...rest
					]
				})
			]

			const csvContent = rows.map(row => row.join(',')).join('\n')
			await DataGridCsvController.download(csvContent)
		} catch (error: any) {
			NotificationComponent.notifyAndThrowError(error.message)
		} finally {
			this.generationProgress = undefined
		}
	}
}