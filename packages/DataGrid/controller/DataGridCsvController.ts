import { type DataRecord } from './DataRecord.js'
import { type DataGridController } from './DataGridController.js'

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

	constructor(private readonly grid: DataGridController<TData>) { }

	private get visibleColumns() { return this.grid.columns.columns.visible }

	private async *getCsvData(): AsyncGenerator<number, Array<DataRecord<TData>>> {
		if (this.grid.options.getCsvData) {
			return yield* this.grid.options.getCsvData()
		}
		return this.grid.records.records
	}

	private _progress?: number
	get generationProgress() { return this._progress }
	private set generationProgress(value: number | undefined) {
		this._progress = value
		this.grid.host.requestUpdate()
	}

	get isGenerating() { return this._progress !== undefined }

	async generateCsv() {
		if (this.isGenerating) {
			return
		}

		this.generationProgress = 0

		try {
			const dataRecords = new Array<DataRecord<TData>>()

			const asyncIterator = this.getCsvData()
			while (true) {
				const { done, value } = await asyncIterator.next()
				if (done) {
					dataRecords.push(...value)
					break
				}
				this.generationProgress = value
			}

			const maxLevel = Math.max(...dataRecords.map(d => d.level))

			const [firstHeading, ...otherHeadings] = this.visibleColumns.flatMap(c => [...c.generateCsvHeading?.() ?? []].map(DataGridCsvController.sanitize))

			const rows = [
				[firstHeading, ...Array.from({ length: maxLevel }).fill(firstHeading), ...otherHeadings],
				...dataRecords.map(d => {
					const nestedPadding = Array.from({ length: d.level }).fill('')
					const childrenPadding = Array.from({ length: maxLevel - d.level }).fill('')
					const [first, ...rest] = this.visibleColumns
						.flatMap(column => {
							const value = KeyPath.get(d.data, column.dataSelector)
							return [...column.generateCsvValue?.(value, d.data) ?? []].map(DataGridCsvController.sanitize)
						})
					return [
						...nestedPadding,
						first,
						...childrenPadding,
						...rest,
					]
				}),
			]

			const csvContent = rows.map(row => row.join(',')).join('\n')
			await this.grid.options.handleCsv?.(csvContent)
		} catch (error: any) {
			this.grid.options.handleCsvError?.(error)
		} finally {
			this.generationProgress = undefined
		}
	}
}
