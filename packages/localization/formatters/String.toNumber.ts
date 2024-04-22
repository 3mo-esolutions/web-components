import { Localizer } from '../Localizer.js'
import { LanguageCode } from '../LanguageCode.js'

const FOREIGN_LOCALE_TOKENS = ['USD', 'JPY', '$', '¥']

function getLanguageCode(this: string, language?: LanguageCode) {
	if (FOREIGN_LOCALE_TOKENS.some(token => this.endsWith(token))) {
		language = 'en'
	}
	return language ?? Localizer.currentLanguage
}

function toNumber(this: string, language: LanguageCode) {
	const numberString = this.replace(/ /g, '')

	const thousandSeparator = Intl.NumberFormat(language).formatToParts(1000).find(p => p.type === 'group')?.value ?? ''
	const decimalSeparator = Intl.NumberFormat(language).formatToParts(1.1).find(p => p.type === 'decimal')?.value ?? ''

	const number = parseFloat(numberString
		.replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')
		.replace(new RegExp(`\\${decimalSeparator}`), '.')
	)

	return Number.isNaN(number) ? undefined : number
}

String.prototype.toNumber = function (this: string, language?: LanguageCode) {
	const languageCode = getLanguageCode.call(this, language)
	return toNumber.call(this, languageCode)
}

declare global {
	interface String {
		toNumber(language?: LanguageCode): number | undefined
	}
}