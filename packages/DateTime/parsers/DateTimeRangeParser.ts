import { Localizer, type Locale } from '@3mo/localization'

export abstract class DateTimeRangeParser {
	constructor(readonly language: Locale = Localizer.locales.current) { }
	abstract parse(text: string, referenceDate?: DateTime): DateTimeRange | undefined
}
