import { Currency, type CurrencyCode } from './Currency.js'
import { Localizer } from '../Localizer.js'

describe('Currency', () => {
	it('should expose a static instance for every code', () => {
		expect(Currency.EUR.code).toBe('EUR')
		expect(Currency.USD.code).toBe('USD')
		expect(Currency.BTC.code).toBe('BTC')
	})

	// Regression: `code` was a readonly parameter property, so `code = code.toUpperCase()` reassigned
	// the local parameter and never reached `this.code`. Lowercase input survived into `toString()`.
	it('should normalise the code to upper case', () => {
		expect(new Currency('eur' as CurrencyCode).code).toBe('EUR')
		expect(new Currency('eur' as CurrencyCode).toString()).toBe('EUR')
		expect(String(new Currency('uSd' as CurrencyCode))).toBe('USD')
	})

	it('should throw for an unknown code', () => {
		expect(() => new Currency('ZZZ' as CurrencyCode)).toThrowError(/Invalid currency code/)
	})

	it('should resolve a symbol', () => {
		expect(Currency.EUR.symbol).toBe('€')
		expect(Currency.USD.symbol).toBeTruthy()
	})

	it('should fall back to the code when no symbol exists', () => {
		expect(Currency.XTS.symbol).toBe('XTS')
	})

	// Regression: the symbol was always resolved through a hardcoded 'de-DE', so a localization
	// package returned the German symbol no matter which language was current.
	it('should resolve the symbol in the given language', () => {
		expect(Currency.CNY.getSymbol('zh')).toBe('¥')
		expect(Currency.CNY.getSymbol('de')).toBe('CN¥')
		expect(Currency.USD.getSymbol('zh')).toBe('US$')
		expect(Currency.USD.getSymbol('de')).toBe('$')
	})

	it('should default the symbol to the current language', () => {
		expect(Currency.EUR.symbol).toBe(Currency.EUR.getSymbol(Localizer.languages.current))
	})

	// Regression: the ISO 4217 list was missing XCG (Caribbean guilder, replaced ANG in 2025)
	// and ZWG (Zimbabwe Gold, replaced ZWL in 2024).
	it('should include the currently circulating codes that replaced ANG and ZWL', () => {
		expect(Currency.XCG.code).toBe('XCG')
		expect(Currency.ZWG.code).toBe('ZWG')
	})

	// XCG and ZWG are recent enough that not every engine's CLDR data carries a display name for
	// them yet, so they must still format via the bare code rather than throw.
	it('should format every code without throwing', () => {
		for (const code of ['EUR', 'USD', 'XCG', 'ZWG', 'XTS', 'XXX'] as Array<CurrencyCode>) {
			expect(() => 1..formatAsCurrency(new Currency(code), 'de')).withContext(code).not.toThrow()
		}
	})

	// The JSDoc on each static used to describe the *previous* code, because the ISO 4217 table row
	// for "ANTARCTICA - No universal currency" carries no code and was transcribed as a name, shifting
	// every name after it by one. Comments are not observable at runtime, so the JSDoc itself is not
	// covered here; the names are now generated from Intl.DisplayNames instead of transcribed by hand.
	it('should be documented from a source that names each code correctly', () => {
		const displayNames = new Intl.DisplayNames(['en'], { type: 'currency', fallback: 'none' })
		expect(displayNames.of('ARS')).toBe('Argentine Peso')
		expect(displayNames.of('AMD')).toBe('Armenian Dram')
		expect(displayNames.of('XCD')).toBe('East Caribbean Dollar')
	})
})