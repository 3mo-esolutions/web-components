import { Currency } from './Currency.js'

describe('Number', () => {
	it('.format()', () => {
		expect(1234.56.format({ language: 'de' })).toEqual('1234,56')
		expect(1234.56.format('de')).toEqual('1234,56')
	})

	it('.formatAsCurrency()', () => {
		expect(1234.56.formatAsCurrency(undefined, { language: 'de' })).toEqual('1.234,56')
		expect(1234.56.formatAsCurrency(undefined, 'de')).toEqual('1.234,56')
	})

	it('.formatAsCurrency(currencyCode)', () => {
		expect(1234.56.formatAsCurrency('EUR', { language: 'de' })).toEqual('1.234,56 €')
		expect(1234.56.formatAsCurrency('EUR', 'de')).toEqual('1.234,56 €')
	})

	it('.formatAsCurrency(currency)', () => {
		expect(1234.56.formatAsCurrency(Currency.EUR, { language: 'de' })).toEqual('1.234,56 €')
		expect(1234.56.formatAsCurrency(Currency.EUR, 'de')).toEqual('1.234,56 €')
	})

	it('.formatAsUnit()', () => {
		expect(1234.56.formatAsUnit('kilometer-per-hour', { language: 'de' })).toEqual('1.234,56 km/h')
		expect(1234.56.formatAsUnit('kilometer-per-hour', 'de')).toEqual('1.234,56 km/h')
	})

	it('.formatAsPercent()', () => {
		expect(12.34.formatAsPercent({ language: 'de' })).toEqual('12,34 %')
		expect(12.34.formatAsPercent('de')).toEqual('12,34 %')
	})

	it('.formatAsCurrency() with more than 2 decimal places', () => {
		expect(1234.567.formatAsCurrency('EUR', { language: 'de' })).toEqual('1.234,567 €')
		expect(1234.56789.formatAsCurrency('EUR', { language: 'de' })).toEqual('1.234,56789 €')
	})
})