import { Localizer } from '../Localizer.js'
import { type LanguageCode } from '../LanguageCode.js'

String.prototype.toNumber = function (this: string, language = Localizer.currentLanguage) {
	const numberString = this.replace(/ /g, '')

	const thousandSeparator = Intl.NumberFormat(language).formatToParts(1000).find(p => p.type === 'group')?.value ?? ''
	const decimalSeparator = Intl.NumberFormat(language).formatToParts(1.1).find(p => p.type === 'decimal')?.value ?? ''

	const number = parseFloat(numberString
		.replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')
		.replace(new RegExp(`\\${decimalSeparator}`), '.')
	)

	return Number.isNaN(number) ? undefined : number
}

declare global {
	interface String {
		toNumber(language?: LanguageCode): number | undefined
	}
}