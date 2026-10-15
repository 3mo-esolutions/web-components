import { type Locale, Localizer, extractDateTimeFormatOptions, getDateTimeFormatter } from '@3mo/localization'
import { type DateTimeRangeParser } from './parsers/DateTimeRangeParser.js'
import { DateTimeRangeDelimiterParser } from './index.js'
import { type ParsingParameters, extractParsingParameters } from './extractParsingParameters.js'

/** A range between two `DateTime`s, either of which may be open, formatted and parsed the way the language writes ranges. */
export class DateTimeRange {
	private static readonly customParsers = new Array<Constructor<DateTimeRangeParser>>()

	static addParser(parser: Constructor<DateTimeRangeParser>) {
		this.customParsers.push(parser)
	}

	static parse(...parameters: ParsingParameters) {
		const [text, language, referenceDate] = extractParsingParameters(parameters)

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

	private static readonly untilDelimiters = new Map<string, string | undefined>()

	/** The locale's delimiter between the two ends of a range, e.g. "–". */
	static getUntilDelimiter(locale: Locale = Localizer.locales.current) {
		const key = String(locale)
		if (DateTimeRange.untilDelimiters.has(key)) {
			return DateTimeRange.untilDelimiters.get(key)
		}
		const formatter = getDateTimeFormatter(key)
		const start = new Date('2010-01-01T00:00:00.000Z')
		const shared = formatter.formatRangeToParts(start, new Date('2020-01-01T00:00:00.000Z')).find(part => part.source === 'shared')?.value
		// The shared part also carries what the language writes after a date, e.g. the " г." of Bulgarian "1.01.2010 г. – 1.01.2020 г.".
		const lastPartOfStart = formatter.formatToParts(start).at(-1)
		const suffix = lastPartOfStart?.type === 'literal' ? lastPartOfStart.value : ''
		const delimiter = (suffix && shared?.startsWith(suffix) ? shared.slice(suffix.length) : shared)?.trim()
		DateTimeRange.untilDelimiters.set(key, delimiter)
		return delimiter
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
		return (other.start && this.start?.equals(other.start) || this.start === other.start)
			&& (other.end && this.end?.equals(other.end) || this.end === other.end)
	}

	toString() {
		return this.format()
	}

	toJSON() {
		return this.isInfinite ? undefined
			: [this.start?.toJSON() ?? '', this.end?.toJSON() ?? ''].join('~')
	}

	formatAsDateRange(...options: Parameters<DateTime['formatAsDate']>) {
		return this._format({
			options,
			formatter: (dateTime, ...options) => dateTime.formatAsDate(...options),
			defaultOptions: { dateStyle: 'medium' },
		})
	}

	format(...options: Parameters<DateTime['format']>) {
		return this._format({
			options,
			formatter: (dateTime, ...options) => dateTime.format(...options),
			defaultOptions: { dateStyle: 'medium', timeStyle: 'medium' },
		})
	}

	private _format({ formatter, options, defaultOptions }: {
		formatter: (dateTime: DateTime, ...options: Parameters<DateTime['format']>) => string
		options: Parameters<DateTime['format']>
		defaultOptions: Intl.DateTimeFormatOptions
	},
	) {
		if (!this.start && !this.end) {
			return ''
		}

		const [language, explicitOptions] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, defaultOptions)

		if (!this.end || !this.start) {
			const delimiter = DateTimeRange.getUntilDelimiter(language)
			return !this.end
				? formatter(this.start as DateTime, ...options) + delimiter?.trimEnd()
				: delimiter?.trimStart() + formatter(this.end as DateTime, ...options)
		}

		if ('week' in explicitOptions && explicitOptions.week) {
			return formatter(this.start as DateTime, ...options) + ' – ' + formatter(this.end as DateTime, ...options)
		}

		return getDateTimeFormatter(language, explicitOptions).formatRange(this.start, this.end)
	}
}

globalThis.DateTimeRange = DateTimeRange
type DateTimeRangeClass = typeof DateTimeRange
declare global {
	var DateTimeRange: DateTimeRangeClass
	type DateTimeRange = InstanceType<DateTimeRangeClass>
}
