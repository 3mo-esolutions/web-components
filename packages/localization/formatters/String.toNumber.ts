import { Localizer } from '../Localizer.js'
import { type LanguageCode } from '../LanguageCode.js'

const separatorRegexByLanguage = new Map<LanguageCode, { readonly thousandRegex: RegExp, readonly decimalRegex: RegExp }>()
const spaceRegex = / /g

String.prototype.toNumber = function (this: string, language = Localizer.currentLanguage) {
	if (!separatorRegexByLanguage.has(language)) {
		const thousandSeparator = Intl.NumberFormat(language).formatToParts(1000).find(p => p.type === 'group')?.value ?? ''
		const thousandRegex = new RegExp(`\\${thousandSeparator}`, 'g')

		const decimalSeparator = Intl.NumberFormat(language).formatToParts(1.1).find(p => p.type === 'decimal')?.value ?? ''
		const decimalRegex = new RegExp(`\\${decimalSeparator}`)

		separatorRegexByLanguage.set(language, { thousandRegex, decimalRegex })
	}

	const { thousandRegex, decimalRegex } = separatorRegexByLanguage.get(language)!

	const numberString = this.replace(spaceRegex, '')
	const number = parseFloat(numberString
		.replace(thousandRegex, '')
		.replace(decimalRegex, '.')
	)

	return Number.isNaN(number) ? undefined : number
}

declare global {
	interface String {
		toNumber(language?: LanguageCode): number | undefined
	}
}