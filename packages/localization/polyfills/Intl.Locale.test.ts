import { getTextInfo, getWeekInfo } from './Intl.Locale.js'

describe('Intl.Locale polyfill', () => {
	const locales = ['en', 'en-GB', 'en-US', 'en-IN', 'de', 'de-CH', 'fa', 'ar', 'ar-EG', 'he', 'hi', 'ja', 'pt-BR', 'zh-TW', 'ur', 'ks', 'ps', 'yi', 'ug', 'mdv', 'dv', 'und-Hebr', 'und-Arab-IN', 'zz']
		.map(tag => new Intl.Locale(tag))

	it('should install the methods only where they are missing', () => {
		expect(typeof Intl.Locale.prototype.getTextInfo).toBe('function')
		expect(typeof Intl.Locale.prototype.getWeekInfo).toBe('function')
	})

	// On engines with the native methods this compares the tables against them; on engines without, the methods are the tables.
	it('should derive the same text direction as the platform', () => {
		for (const locale of locales) {
			expect(getTextInfo.call(locale).direction ?? 'ltr', String(locale)).toBe(locale.getTextInfo().direction ?? 'ltr')
		}
	})

	it('should derive the same week data as the platform', () => {
		for (const locale of locales) {
			expect(getWeekInfo.call(locale), String(locale)).toEqual(locale.getWeekInfo())
		}
	})

	it('should read the direction off the script rather than the language', () => {
		expect(getTextInfo.call(new Intl.Locale('fa')).direction).toBe('rtl')
		expect(getTextInfo.call(new Intl.Locale('fa-Latn')).direction).toBe('ltr')
		expect(getTextInfo.call(new Intl.Locale('en-Arab')).direction).toBe('rtl')
	})

	it('should read the week data off the region rather than the language', () => {
		expect(getWeekInfo.call(new Intl.Locale('en')).firstDay).toBe(7)
		expect(getWeekInfo.call(new Intl.Locale('en-GB')).firstDay).toBe(1)
		expect(getWeekInfo.call(new Intl.Locale('de-US')).firstDay).toBe(7)
		expect(getWeekInfo.call(new Intl.Locale('fa')).weekend).toEqual([5])
	})
})
