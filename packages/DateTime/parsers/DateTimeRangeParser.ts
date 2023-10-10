import { Localizer } from '@3mo/localization'

export abstract class DateTimeRangeParser {
	constructor(readonly language = Localizer.currentLanguage) { }
	abstract parse(text: string, referenceDate?: DateTime): DateTimeRange | undefined
}