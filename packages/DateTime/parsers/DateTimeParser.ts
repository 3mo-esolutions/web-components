import { Localizer } from '@3mo/localization'

export abstract class DateTimeParser {
	constructor(readonly language = Localizer.languages.current) { }
	abstract parse(text: string, referenceDate?: DateTime): DateTime | undefined
}