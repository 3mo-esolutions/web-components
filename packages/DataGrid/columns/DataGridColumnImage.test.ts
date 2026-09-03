import '../index.js'
import { html, render } from '@a11d/lit'
import { DataGridColumnImage } from './DataGridColumnImage.js'

type Item = { id: number, img: string, label: string }

const source = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

describe('DataGridColumnImage', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, img: source, label: 'Portrait of Alice' }

	afterEach(() => render(html.nothing, container))

	it('should render an image only for a value', () => {
		const column = new DataGridColumnImage<Item>()

		render(column.getContentTemplate(source, datum), container)
		expect(container.querySelector('img')?.getAttribute('src')).toBe(source)

		render(column.getContentTemplate(undefined, datum), container)
		expect(container.querySelector('img')).toBeNull()

		render(column.getContentTemplate('', datum), container)
		expect(container.querySelector('img')).toBeNull()
	})

	it('should resolve the tooltip through a key path or a function and use it as title and alt text', () => {
		const column = new DataGridColumnImage<Item>()

		render(column.getContentTemplate(source, datum), container)
		expect(container.querySelector('img')!.hasAttribute('title')).toBeFalse()
		expect(container.querySelector('img')!.hasAttribute('alt')).toBeFalse()

		column.tooltipSelector = 'label'
		render(column.getContentTemplate(source, datum), container)
		expect(container.querySelector('img')!.getAttribute('title')).toBe('Portrait of Alice')
		expect(container.querySelector('img')!.getAttribute('alt')).toBe('Portrait of Alice')

		column.tooltipSelector = (data: Item) => `Image #${data.id}`
		render(column.getContentTemplate(source, datum), container)
		expect(container.querySelector('img')!.getAttribute('title')).toBe('Image #1')
		expect(container.querySelector('img')!.getAttribute('alt')).toBe('Image #1')
	})

	it('should export the tooltip text instead of the image URL in CSV', () => {
		const column = new DataGridColumnImage<Item>()

		expect([...column.generateCsvValue(source, datum)]).toEqual([''])

		column.tooltipSelector = 'label'

		expect([...column.generateCsvValue(source, datum)]).toEqual(['Portrait of Alice'])
	})

	it('should be non-sortable and non-editable by default', () => {
		const column = new DataGridColumnImage<Item>()
		column.dataSelector = 'img'

		expect(column.column.sortable).toBeFalse()
		expect(column.column.editable).toBeFalse()
	})
})