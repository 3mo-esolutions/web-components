import { DateTime } from '../DateTime.js'
import { DateTimeRange } from '../DateTimeRange.js'
import { DateTimeRangeParser } from './DateTimeRangeParser.js'
import { Localizer } from '@3mo/localization'

export class DateTimeRangeDelimiterParser extends DateTimeRangeParser {
	private static readonly delimiters = ['–', '~'] as const

	private static getUntilDelimiter(language = Localizer.languages.current) {
		const parts = Intl.DateTimeFormat(language).formatRangeToParts(
			new Date('2010-01-01T00:00:00.000Z'),
			new Date('2020-01-01T00:00:00.000Z')
		)
		return parts.find(part => part.source === 'shared')?.value.trim()
	}

	private readonly regex: RegExp

	constructor(override readonly language = Localizer.languages.current) {
		super(language)
		const delimiters = [...new Set([...DateTimeRangeDelimiterParser.delimiters, DateTimeRangeDelimiterParser.getUntilDelimiter(language)])].join('')
		this.regex = new RegExp(`^(?<start>.+?)(?<![${delimiters}])\\s*[${delimiters}]\\s*(?<![${delimiters}])(?<end>.+?)$`)
	}

	override parse(text: string, referenceDate?: DateTime) {
		const { start, end } = this.regex.exec(text)?.groups ?? {}
		return new DateTimeRange(
			start ? DateTime.parseAsDateTime(start, referenceDate) : undefined,
			end ? DateTime.parseAsDateTime(end, referenceDate) : undefined
		)
	}
}