import { type Locale, Localizer } from '@3mo/localization'

export type ParsingParameters =
	| [text: string, language?: Locale]
	| [text: string, referenceDate?: DateTime, language?: Locale]

export function extractParsingParameters(parameters: ParsingParameters): [text: string, language: Locale, referenceDate: DateTime | undefined] {
	let text: string
	let referenceDate: DateTime | undefined
	let language: Locale | undefined

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

	return [text!, language ?? Localizer.locales.current, referenceDate ?? new DateTime()]
}
