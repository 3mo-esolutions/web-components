import { LanguageCode, Localizer, extractDateTimeFormatOptions } from '@3mo/localization'
import { DateTimeRangeParser } from './parsers/DateTimeRangeParser.js'
import { DateTimeRangeDelimiterParser } from './index.js'

export class DateTimeRange {
	private static readonly customParsers = new Array<Constructor<DateTimeRangeParser>>()

	static addParser(parser: Constructor<DateTimeRangeParser>) {
		this.customParsers.push(parser)
	}

	static parse(text: string, referenceDate = new DateTime, language = Localizer.currentLanguage) {
		if (!text.trim()) {
			return undefined
		}

		const parsers = [
			new DateTimeRangeDelimiterParser(language),
			...DateTimeRange.customParsers.map(parser => new parser(language)),
		]

		for (const parser of parsers) {
			const dateTimeRange = parser.parse(text, referenceDate)
			if (dateTimeRange) {
				return dateTimeRange
			}
		}

		return undefined
	}

	private static getUntilDelimiter(language: LanguageCode = Localizer.currentLanguage) {
		const parts = Intl.DateTimeFormat(language).formatRangeToParts(
			new Date('2010-01-01T00:00:00.000Z'),
			new Date('2020-01-01T00:00:00.000Z')
		)
		return parts.find(part => part.source === 'shared')?.value.trim()
	}

	private static sort(start?: DateTime, end?: DateTime) {
		return !start || !end
			? { start, end }
			: start > end
				? { start: end, end: start }
				: { start, end }
	}

	readonly start?: DateTime
	readonly end?: DateTime

	constructor(startDate?: Date, endDate?: Date) {
		const startD = startDate ? new DateTime(startDate) : undefined
		const endD = endDate ? new DateTime(endDate) : undefined
		const { start, end } = DateTimeRange.sort(startD, endD)
		this.start = start
		this.end = end
	}

	get isInfinite() {
		return !this.start && !this.end
	}

	get timeZoneId() {
		return this.start?.timeZoneId ?? this.end?.timeZoneId ?? new DateTime().timeZoneId
	}

	get calendarId() {
		return this.start?.calendarId ?? this.end?.calendarId ?? new DateTime().calendarId
	}

	includes(date: Date) {
		return (!this.start || date >= this.start) && (!this.end || date <= this.end)
	}

	equals(other: DateTimeRange) {
		return other.start && this.start?.equals(other.start)
			&& this.end && other.end?.equals(this.end)
	}

	toString() {
		return this.format()
	}

	formatAsDateRange(...options: Parameters<DateTime['formatAsDate']>) {
		return this._format({
			options,
			formatter: (dateTime, ...options) => dateTime.formatAsDate(...options),
			defaultOptions: {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			}
		})
	}

	format(...options: Parameters<DateTime['format']>) {
		return this._format({
			options,
			formatter: (dateTime, ...options) => dateTime.format(...options),
			defaultOptions: {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			}
		})
	}

	private _format({ formatter, options, defaultOptions }: {
		formatter: (dateTime: DateTime, ...options: Parameters<DateTime['format']>) => string
		options: Parameters<DateTime['format']>
		defaultOptions: Intl.DateTimeFormatOptions
	}
	) {
		if (!this.start && !this.end) {
			return ''
		}

		const [language, explicitOptions] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, defaultOptions)

		const delimiter = DateTimeRange.getUntilDelimiter(language)

		if (!this.end) {
			return formatter(this.start as DateTime, ...options) + delimiter?.trimEnd()
		}

		if (!this.start) {
			return delimiter?.trimStart() + formatter(this.end as DateTime, ...options)
		}

		return Intl.DateTimeFormat(language, explicitOptions).formatRange(this.start, this.end)
	}
}

globalThis.DateTimeRange = DateTimeRange
type DateTimeRangeClass = typeof DateTimeRange
declare global {
	// eslint-disable-next-line
	var DateTimeRange: DateTimeRangeClass
	type DateTimeRange = InstanceType<DateTimeRangeClass>
}