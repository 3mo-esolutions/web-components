import '../../index.js'
import { html, render } from '@a11d/lit'
import { Currency } from '@3mo/localization'
import { DataGridColumnCurrency } from './DataGridColumnCurrency.js'

type Item = { id: number, amount: number, curr?: string }

// Currency output carries non-breaking spaces in several locales, and Chrome and Firefox do not agree on them.
const normalize = (text: string) => text.replace(/\s+/gu, ' ').trim()

describe('DataGridColumnCurrency', () => {
	const container = document.createElement('div')
	const datum: Item = { id: 1, amount: 1234.5 }

	let previousDefaultCurrency: Currency | undefined
	beforeEach(() => previousDefaultCurrency = DataGridColumnCurrency.defaultCurrency)
	afterEach(() => DataGridColumnCurrency.defaultCurrency = previousDefaultCurrency)

	afterEach(() => render(html.nothing, container))

	const currencyOf = (column: DataGridColumnCurrency<Item>, data: Item) => [...column.generateCsvValue(1, data)].at(-1)

	it('should resolve the currency from the data selector, then the property, then the static default', () => {
		const column = new DataGridColumnCurrency<Item>()
		column.currencyDataSelector = 'curr'
		column.currency = Currency.USD
		DataGridColumnCurrency.defaultCurrency = Currency.GBP

		expect(currencyOf(column, { id: 1, amount: 1, curr: 'JPY' })).toBe('JPY')
		expect(currencyOf(column, { id: 1, amount: 1 })).toBe('USD')

		column.currency = undefined

		expect(currencyOf(column, { id: 1, amount: 1 })).toBe('GBP')
	})

	it('should format the value as the resolved currency', () => {
		const column = new DataGridColumnCurrency<Item>()
		column.currency = Currency.USD

		render(column.getContentTemplate(1234.5, datum), container)
		const text = normalize(container.textContent!)

		expect(text).toBe(normalize((1234.5).formatAsCurrency(Currency.USD)))
		expect(text).not.toBe(normalize((1234.5).formatAsCurrency(Currency.EUR)))
		expect(text).not.toBe(normalize((1234.5).format()))
	})

	it('should render nothing for a non-finite value, while still rendering a zero', () => {
		const column = new DataGridColumnCurrency<Item>()
		column.currency = Currency.USD

		render(column.getContentTemplate(NaN, datum), container)
		expect(container.textContent).toBe('')

		render(column.getContentTemplate(undefined, datum), container)
		expect(container.textContent).toBe('')

		render(column.getContentTemplate(0, datum), container)
		expect(normalize(container.textContent!)).toBe(normalize((0).formatAsCurrency(Currency.USD)))
	})

	it('should append a Currency heading and each datum\'s currency code to the CSV', () => {
		const column = new DataGridColumnCurrency<Item>()
		column.heading = 'Price'
		column.currencyDataSelector = 'curr'

		expect([...column.generateCsvHeading()].map(String)).toEqual(['Price', t('Currency').toString()])
		expect([...column.generateCsvValue(100, { id: 1, amount: 100, curr: 'JPY' })]).toEqual(['100', 'JPY'])
		expect([...column.generateCsvValue(200, { id: 2, amount: 200, curr: 'USD' })]).toEqual(['200', 'USD'])
	})

	it('should tunnel the resolved currency into the edit field', () => {
		const column = new DataGridColumnCurrency<Item>()
		column.currency = Currency.USD
		column.currencyDataSelector = 'curr'

		render(column.getEditContentTemplate(100, { id: 1, amount: 100, curr: 'JPY' }), container)

		expect(container.querySelector('mo-field-currency')!.currency?.code).toBe('JPY')
	})

	it('should format the footer sum with the format options', () => {
		const column = new DataGridColumnCurrency<Item>()
		column.currency = Currency.USD
		column.formatOptions = { minimumFractionDigits: 4 }

		render(column.getSumTemplate(1234.5), container)
		const text = normalize(container.textContent!)

		expect(text).toBe(normalize((1234.5).formatAsCurrency(Currency.USD, { minimumFractionDigits: 4 })))
		expect(text).not.toBe(normalize((1234.5).formatAsCurrency(Currency.USD)))
	})

	// Pins current behaviour: cell content ignores formatOptions
	it('should ignore the format options in its cell content', () => {
		const column = new DataGridColumnCurrency<Item>()
		column.currency = Currency.USD
		column.formatOptions = { minimumFractionDigits: 4 }

		render(column.getContentTemplate(1234.5, datum), container)

		expect(normalize(container.textContent!)).toBe(normalize((1234.5).formatAsCurrency(Currency.USD)))
	})
})