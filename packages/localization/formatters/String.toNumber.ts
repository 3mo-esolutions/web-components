import { Localizer } from '../Localizer.js'
import { type LanguageCode } from '../LanguageCode.js'

/**
 * Whitespace, together with the bidirectional control characters which `Intl` embeds in right-to-left
 * output: the arabic letter mark, the left-to-right and right-to-left marks, the embeddings and
 * overrides, and the isolates.
 */
const ignoredRegex = /[\s؜‎‏‪-‮⁦-⁩]/g

const substitutionsByLanguage = new Map<LanguageCode, ReadonlyMap<string, string>>()

/**
 * Maps each character a language uses to write a number onto its ASCII counterpart, so that the result
 * can be handed to `parseFloat`. Group separators map onto nothing, as they carry no meaning.
 */
function getSubstitutions(language: LanguageCode) {
	if (!substitutionsByLanguage.has(language)) {
		// A single negative sample with ten integer digits and a fraction exposes every digit, both
		// separators and the minus sign at once. `useGrouping` has to be forced, since languages whose
		// CLDR `minimumGroupingDigits` is 2 would otherwise expose no group separator at all.
		const parts = Intl.NumberFormat(language, { useGrouping: true }).formatToParts(-1234567890.1)
		const valueOf = (type: Intl.NumberFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''
		const digits = parts.filter(part => part.type === 'integer').map(part => part.value).join('')

		const substitutions = new Map([
			[valueOf('group'), ''],
			[valueOf('decimal'), '.'],
			[valueOf('minusSign'), '-'],
		])

		// Positional numbering systems spell the sample as 1234567890, which inverts to a digit map.
		// Anything else is left alone rather than guessed at.
		if ([...digits].length === 10 && new Set(digits).size === 10) {
			for (const [index, digit] of [...digits].entries()) {
				substitutions.set(digit, String((index + 1) % 10))
			}
		}

		substitutions.delete('')
		substitutionsByLanguage.set(language, substitutions)
	}
	return substitutionsByLanguage.get(language)!
}

String.prototype.toNumber = function (this: string, language = Localizer.languages.current) {
	const substitutions = getSubstitutions(language)
	const text = [...this.replace(ignoredRegex, '')]
		.map(character => substitutions.get(character) ?? character)
		.join('')
	const number = parseFloat(text)

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