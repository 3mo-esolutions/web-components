import { Localizer } from '../Localizer.js'
import { type LanguageCode } from '../LanguageCode.js'

/** Whitespace, along with the bidirectional control characters `Intl` embeds in right-to-left output. */
const ignoredRegex = /[\s؜‎‏‪-‮⁦-⁩]/g

const substitutionsByLanguage = new Map<LanguageCode, ReadonlyMap<string, string>>()

/** Maps every character a language writes numbers with onto its ASCII counterpart, so that `parseFloat` can read it. */
function getSubstitutions(language: LanguageCode) {
	if (!substitutionsByLanguage.has(language)) {
		// `useGrouping` has to be forced and the sample has to exceed four digits: languages whose CLDR
		// `minimumGroupingDigits` is 2 render 1000 ungrouped and expose no group part at all, which used to
		// leave the separator empty and make the regex below a lone backslash.
		const format = Intl.NumberFormat(language, { useGrouping: true })
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

		substitutionsByLanguage.set(language, substitutions)
	}

	return substitutionsByLanguage.get(language)!
}

String.prototype.toNumber = function (this: string, language = Localizer.languages.current) {
	const substitutions = getSubstitutions(language)

	const number = parseFloat([...this.replace(ignoredRegex, '')]
		.map(character => substitutions.get(character) ?? character)
		.join('')
	)

	return Number.isNaN(number)
		? undefined
		: Object.is(number, -0)
			? 0
			: number
}

declare global {
	interface String {
		toNumber(language?: LanguageCode): number | undefined
	}
}