import { Downloader } from '@3mo/downloader'

export class CsvGenerator {
	static generate<TData>(
		data: Array<TData>,
		keys = Object.keys(data[0]!) as Array<KeyPathOf<TData>>,
		title = 'Export'
	) {
		const dataClone = data.map((data: TData) => {
			keys.forEach(key => {
				const value = getValueByKeyPath(data, key)
				setValueByKeyPath(data, key, value instanceof Date
					? isNaN(value.getTime()) ? '' : value.toISOString() as any
					: value
				)
			})
			return data
		})

		const csv = `${keys.join(',')}
			${dataClone.map(data => keys.map(selector => `"${getValueByKeyPath(data, selector)}"`).join(',')).join('\r\n')}
		`
		// @ts-expect-error manifest can be undefined
		const manifest = globalThis.manifest
		const fileName = (manifest?.short_name ?? '') + title.replace(/ /g, '_')
		Downloader.download(`data:text/csv;charset=utf-8,${escape(csv)}`, `${fileName}.csv`)
	}
}