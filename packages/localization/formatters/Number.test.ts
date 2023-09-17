import { Currency } from './Currency.js'

describe('Number', () => {
	it('.format()', () => {
		expect(1234.56.format({ language: 'de' })).toEqual('1234,56')
	})

	it('.formatAsCurrency()', () => {
		expect(1234.56.formatAsCurrency({ language: 'de' })).toEqual('1.234,56')
	})

	it('.formatAsCurrency(currencyCode)', () => {
		expect(1234.56.formatAsCurrency('EUR', { language: 'de' })).toEqual('1.234,56 €')
	})

	it('.formatAsCurrency(currency)', () => {
		expect(1234.56.formatAsCurrency(Currency.EUR, { language: 'de' })).toEqual('1.234,56 €')
	})

	it('.formatAsUnit()', () => {
		expect(1234.56.formatAsUnit('kilometer-per-hour', { language: 'de' })).toEqual('1.234,56 km/h')
	})

	it('.formatAsPercent()', () => {
		expect(12.34.formatAsPercent({ language: 'de' })).toEqual('12,34 %')
	})
})