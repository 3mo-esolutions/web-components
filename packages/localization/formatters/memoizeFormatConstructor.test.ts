import { memoizeFormatConstructor } from './memoizeFormatConstructor.js'

describe('memoizeFormatConstructor', () => {
	it('should reuse the formatter of equal arguments', () => {
		const getFormatter = memoizeFormatConstructor(Intl.NumberFormat)
		expect(getFormatter('de', { minimumFractionDigits: 2 })).toBe(getFormatter('de', { minimumFractionDigits: 2 }))
	})

	it('should reuse the formatter regardless of the order of the options', () => {
		const getFormatter = memoizeFormatConstructor(Intl.NumberFormat)
		expect(getFormatter('de', { minimumFractionDigits: 2, useGrouping: true }))
			.toBe(getFormatter('de', { useGrouping: true, minimumFractionDigits: 2 }))
	})

	it('should create a formatter of its own for different arguments', () => {
		const getFormatter = memoizeFormatConstructor(Intl.NumberFormat)
		expect(getFormatter('de', { minimumFractionDigits: 2 })).not.toBe(getFormatter('de', { minimumFractionDigits: 3 }))
		expect(getFormatter('de')).not.toBe(getFormatter('en'))
	})

	it('should keep an option set to null apart from one left undefined, as Intl treats them differently', () => {
		const getFormatter = memoizeFormatConstructor(Intl.NumberFormat)
		const currency = { style: 'currency', currency: 'EUR' } as const
		expect(getFormatter('de', { ...currency, minimumFractionDigits: undefined }).format(1)).toBe('1,00 €')
		expect(getFormatter('de', { ...currency, minimumFractionDigits: null as unknown as number }).format(1)).toBe('1 €')
	})

	it('should treat an option left undefined like an option not given', () => {
		const getFormatter = memoizeFormatConstructor(Intl.NumberFormat)
		expect(getFormatter('de', { minimumFractionDigits: undefined })).toBe(getFormatter('de', {}))
	})

	it('should create formatters configured with the arguments', () => {
		const getFormatter = memoizeFormatConstructor(Intl.NumberFormat)
		expect(getFormatter('de', { minimumFractionDigits: 2 }).format(1234.5)).toBe('1.234,50')
	})
})
