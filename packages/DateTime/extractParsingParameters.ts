import { type LanguageCode, Localizer } from '@3mo/localization'

export type ParsingParameters =
	| [text: string, language?: LanguageCode]
	| [text: string, language?: LanguageCode]
	| [text: string, referenceDate: DateTime, language?: LanguageCode]

export function extractParsingParameters(parameters: ParsingParameters): [text: string, language: LanguageCode, referenceDate: DateTime | undefined,] {
	let text: string
	let referenceDate: DateTime | undefined
	let language: LanguageCode | undefined

	if (parameters.length === 1) {
		text = parameters[0]
	}

	if (parameters.length === 2) {
		if (parameters[1] instanceof DateTime) {
			text = parameters[0]
			referenceDate = parameters[1]
		} else {
			text = parameters[0]
			language = parameters[1]
		}
	}

	if (parameters.length === 3) {
		[text, referenceDate, language] = parameters
	}

	return [text!, language ?? Localizer.currentLanguage, referenceDate ?? new DateTime]
}