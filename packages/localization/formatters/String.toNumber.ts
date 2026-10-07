import { Localizer } from '../Localizer.js'
import { type Locale } from '../LanguageCode.js'

/** Whitespace, along with the bidirectional control characters `Intl` embeds in right-to-left output. */
const ignoredRegex = /[\s؜‎‏‪-‮⁦-⁩]/g

const substitutionsByLocale = new Map<string, ReadonlyMap<string, string>>()

/** Maps every character a locale writes numbers with onto its ASCII counterpart, so that `parseFloat` can read it. */
function getSubstitutions(locale: Locale) {
	const key = String(locale)
	if (!substitutionsByLocale.has(key)) {
		// `useGrouping` has to be forced and the sample has to exceed four digits: languages whose CLDR
		// `minimumGroupingDigits` is 2 render 1000 ungrouped and expose no group part at all, which used to
		// leave the separator empty and make the regex below a lone backslash.
		const format = Intl.NumberFormat(locale, { useGrouping: true })
		const parts = format.formatToParts(-10_000.1)
		const separator = (type: Intl.NumberFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''

		const substitutions = new Map<string, string>()
		for (let digit = 0; digit <= 9; digit++) {
			substitutions.set(format.format(digit), String(digit))
		}
		substitutions.set(separator('group'), '')
		substitutions.set(separator('decimal'), '.')
		substitutions.set(separator('minusSign'), '-')
		substitutions.delete('')

		substitutionsByLocale.set(key, substitutions)
	}

	return substitutionsByLocale.get(key)!
}

String.prototype.toNumber = function (this: string, locale: Locale = Localizer.locales.current) {
	const substitutions = getSubstitutions(locale)

	const number = parseFloat([...this.replace(ignoredRegex, '')]
		.map(character => substitutions.get(character) ?? character)
		.join(''),
	)

	return Number.isNaN(number)
		? undefined
		: Object.is(number, -0)
			? 0
			: number
}

declare global {
	interface String {
		toNumber(locale?: Locale): number | undefined
	}
}
