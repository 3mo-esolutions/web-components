import { Localizer, type Locale } from '@3mo/localization'

export abstract class DateTimeParser {
	constructor(readonly language: Locale = Localizer.locales.current) { }
	abstract parse(text: string, referenceDate?: DateTime): DateTime | undefined
}
