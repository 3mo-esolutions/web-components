import './index.js'
import { html, render } from '@a11d/lit'
import { description, label } from '@a11d/metadata'
import { DataGridColumnBinder } from './DataGridColumnBinder.js'

class Price {
	@label('Net amount') netAmount = 0
	@label('Gross amount') grossAmount = 0

	@label('Purchase price')
	@label.short('PP')
	@description('Before discounts') purchasePrice = 0

	@label('Retail price')
	@description('Including VAT') retailPrice = 0
}

describe('DataGridColumnBinder', () => {
	const { bind } = DataGridColumnBinder.for(Price)
	const container = document.createElement('div')

	afterEach(() => render(html.nothing, container))

	const renderColumn = (keyPath: keyof Price) => {
		render(html`<mo-data-grid-column-text ${bind(keyPath)}></mo-data-grid-column-text>`, container)
		return container.querySelector('mo-data-grid-column-text')!
	}

	it('should apply the key path as data selector and the label as heading', () => {
		const column = renderColumn('grossAmount')

		expect(column.dataSelector).toBe('grossAmount')
		expect(column.heading).toBe('Gross amount')
	})

	it('should apply the description', () => {
		const column = renderColumn('retailPrice')

		expect(column.description).toBe('Including VAT')
	})

	it('should prefer the short label as heading and move the label into the description', () => {
		const column = renderColumn('purchasePrice')

		expect(column.heading).toBe('PP')
		expect(column.description).toBe('Purchase price')
	})

	it('should propagate a changed key path to the data selector and heading', () => {
		renderColumn('grossAmount')

		const column = renderColumn('netAmount')

		expect(column.dataSelector).toBe('netAmount')
		expect(column.heading).toBe('Net amount')
	})

	it('should not overwrite an explicitly configured data selector and heading', () => {
		const renderExplicitColumn = (keyPath: keyof Price) => {
			render(html`<mo-data-grid-column-text .dataSelector=${'somethingElse'} heading='Custom' ${bind(keyPath)}></mo-data-grid-column-text>`, container)
			return container.querySelector('mo-data-grid-column-text')!
		}
		renderExplicitColumn('grossAmount')

		const column = renderExplicitColumn('netAmount')

		expect(column.dataSelector).toBe('somethingElse')
		expect(column.heading).toBe('Custom')
	})

	it('should throw when used on an element other than a column', () => {
		expect(() => render(html`<div ${bind('netAmount')}></div>`, container)).toThrowError(/DataGridColumnComponent/)
	})
})
