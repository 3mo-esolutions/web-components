import { Localizer } from '@3mo/localization'

export abstract class DateTimeRangeParser {
	constructor(readonly language = Localizer.languages.current) { }
	abstract parse(text: string, referenceDate?: DateTime): DateTimeRange | undefined
}