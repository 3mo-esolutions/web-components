import { Temporal, Intl } from 'temporal-polyfill'
import { LanguageCode, Localizer } from '@3mo/localization'
import { TimeSpan } from './TimeSpan.js'
import { type DateTimeParser, DateTimeLocalParser, DateTimeShortcutParser, DateTimeOperationParser, DateTimeNativeParser, DateTimeZeroParser } from './parsers/index.js'
import { Memoize as memoize } from 'typescript-memoize'

const parametersAndLanguageHashFunction = (...parameters: Array<unknown>) => [...parameters, Localizer.currentLanguage].join('')

type DateTimeConstructorParameters =
	| []
	| [options: { calendar?: Temporal.CalendarLike, timeZone?: Temporal.TimeZoneLike }]
	| [zonedDateTime: Temporal.ZonedDateTime]
	| [epochMilliseconds: number]
	| [epochMilliseconds: number, language: LanguageCode]
	| [epochMilliseconds: number, options: { calendar?: Temporal.CalendarLike, timeZone?: Temporal.TimeZoneLike }]

export class DateTime implements Date {
	static readonly isoRegularExpression = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2}(?:\.\d*))(?:Z|(?<offsetSign>\+|-)(?<offset>[\d|:]*))?$/

	private static readonly parsers = new Array<Constructor<DateTimeParser>>()

	static addParser(parser: Constructor<DateTimeParser>) {
		DateTime.parsers.push(parser)
	}

	@memoize(parametersAndLanguageHashFunction)
	static getResolvedOptions(language = Localizer.languages.current) {
		return Intl.DateTimeFormat(language).resolvedOptions()
	}

	@memoize(parametersAndLanguageHashFunction)
	static getCalendar(language = Localizer.languages.current) {
		const { calendar } = DateTime.getResolvedOptions(language)
		return Temporal.Calendar.from(calendar)
	}

	@memoize(parametersAndLanguageHashFunction)
	static getTimeZone(language = Localizer.currentLanguage) {
		const { timeZone } = DateTime.getResolvedOptions(language)
		return Temporal.TimeZone.from(timeZone)
	}

	@memoize(parametersAndLanguageHashFunction)
	static getDateSeparator(language = Localizer.languages.current) {
		return Intl.DateTimeFormat(language)
			.formatToParts(new Date)
			.find(part => part.type === 'literal')
			?.value as string
	}

	@memoize(parametersAndLanguageHashFunction)
	static getTimeSeparator(language = Localizer.languages.current) {
		return Intl.DateTimeFormat(language, { timeStyle: 'short' })
			.formatToParts(new Date)
			.find(part => part.type === 'literal')
			?.value as string
	}

	static parse(...parameters: ParsingParameters) {
		const [text, language, referenceDate] = extractParsingParameters(parameters)

		if (!text.trim()) {
			return undefined
		}

		const parsers = [
			new DateTimeZeroParser(language),
			new DateTimeOperationParser(language),
			new DateTimeLocalParser(language),
			new DateTimeShortcutParser(language),
			new DateTimeNativeParser(language),
			...DateTime.parsers.map(parser => new parser(language)),
		]

		for (const parser of parsers) {
			const dateTime = parser.parse(text, referenceDate)
			if (dateTime) {
				return dateTime
			}
		}

		return undefined
	}

	private readonly _epochMilliseconds: number
	readonly calendar: Temporal.Calendar | Temporal.CalendarProtocol
	readonly timeZone: Temporal.TimeZoneProtocol | Temporal.TimeZone

	constructor(...parameters: DateTimeConstructorParameters) {
		if (parameters.length === 0) {
			[this._epochMilliseconds, this.calendar, this.timeZone] = [Date.now(), DateTime.getCalendar(), DateTime.getTimeZone()]
			return
		}

		if (parameters.length === 1 && parameters[0] instanceof Temporal.ZonedDateTime) {
			const zonedDateTime = parameters[0]
			const { epochMilliseconds, getCalendar, getTimeZone } = zonedDateTime;
			[this._epochMilliseconds, this.calendar, this.timeZone] = [epochMilliseconds, getCalendar(), getTimeZone()]
			return
		}

		if (parameters.length === 1 && typeof parameters[0] === 'object') {
			const options = parameters[0] as { calendar?: Temporal.CalendarLike, timeZone?: Temporal.TimeZoneLike };
			[this._epochMilliseconds, this.calendar, this.timeZone] = [
				Date.now(),
				options.calendar ? Temporal.Calendar.from(options.calendar) : DateTime.getCalendar(),
				options.timeZone ? Temporal.TimeZone.from(options.timeZone) : DateTime.getTimeZone(),
			]
			return
		}

		if (parameters.length === 1 && typeof parameters[0] === 'number') {
			[this._epochMilliseconds, this.calendar, this.timeZone] = [parameters[0], DateTime.getCalendar(), DateTime.getTimeZone()]
			return
		}

		if (parameters.length === 2 && typeof parameters[0] === 'number' && typeof parameters[1] === 'string') {
			const [value, language] = parameters;
			[this._epochMilliseconds, this.calendar, this.timeZone] = [value, DateTime.getCalendar(language), DateTime.getTimeZone(language)]
			return
		}

		if (parameters.length === 2 && typeof parameters[0] === 'number' && typeof parameters[1] === 'object') {
			const [value, options] = parameters;
			[this._epochMilliseconds, this.calendar, this.timeZone] = [
				value,
				options.calendar ? Temporal.Calendar.from(options.calendar) : DateTime.getCalendar(),
				options.timeZone ? Temporal.TimeZone.from(options.timeZone) : DateTime.getTimeZone(),
			]
			return
		}

		throw new Error('Invalid parameters')
	}

	@memoize() private get date() { return new Date(this.epochMilliseconds) }

	@memoize() get temporalInstant() { return Temporal.Instant.fromEpochMilliseconds(this._epochMilliseconds) }

	@memoize() get zonedDateTime() { return this.temporalInstant.toZonedDateTime({ calendar: this.calendar, timeZone: this.timeZone }) }

	@memoize() get era() { return this.zonedDateTime.era }
	@memoize() get eraYear() { return this.zonedDateTime.eraYear }
	@memoize() get year() { return this.zonedDateTime.year }
	@memoize() get month() { return this.zonedDateTime.month }
	@memoize() get monthCode() { return this.zonedDateTime.monthCode }
	@memoize() get day() { return this.zonedDateTime.day }
	@memoize() get hour() { return this.zonedDateTime.hour }
	@memoize() get minute() { return this.zonedDateTime.minute }
	@memoize() get second() { return this.zonedDateTime.second }
	@memoize() get millisecond() { return this.zonedDateTime.millisecond }
	@memoize() get microsecond() { return this.zonedDateTime.microsecond }
	@memoize() get nanosecond() { return this.zonedDateTime.nanosecond }
	@memoize() get timeZoneId() { return this.zonedDateTime.timeZoneId }
	@memoize() get calendarId() { return this.zonedDateTime.calendarId }
	@memoize() get dayOfWeek() { return this.zonedDateTime.dayOfWeek }
	@memoize() get dayOfYear() { return this.zonedDateTime.dayOfYear }
	@memoize() get weekOfYear() { return this.zonedDateTime.weekOfYear }
	@memoize() get yearOfWeek() { return this.zonedDateTime.yearOfWeek }
	@memoize() get hoursInDay() { return this.zonedDateTime.hoursInDay }
	@memoize() get daysInWeek() { return this.zonedDateTime.daysInWeek }
	@memoize() get daysInMonth() { return this.zonedDateTime.daysInMonth }
	@memoize() get daysInYear() { return this.zonedDateTime.daysInYear }
	@memoize() get monthsInYear() { return this.zonedDateTime.monthsInYear }
	@memoize() get inLeapYear() { return this.zonedDateTime.inLeapYear }
	@memoize() get offsetNanoseconds() { return this.zonedDateTime.offsetNanoseconds }
	@memoize() get offset() { return this.zonedDateTime.offset }
	@memoize() get epochSeconds() { return this.zonedDateTime.epochSeconds }
	@memoize() get epochMilliseconds() { return this.zonedDateTime.epochMilliseconds }
	@memoize() get epochMicroseconds() { return this.zonedDateTime.epochMicroseconds }
	@memoize() get epochNanoseconds() { return this.zonedDateTime.epochNanoseconds }

	@memoize() get dayStart() { return new DateTime(this.zonedDateTime.startOfDay()) }
	@memoize() get dayEnd() { return new DateTime(this.zonedDateTime.add({ days: 1 }).startOfDay().add({ nanoseconds: -1 })) }
	@memoize() get dayRange() { return new DateTimeRange(this.dayStart, this.dayEnd) }

	@memoize() get weekStart() { return this.subtract({ days: this.dayOfWeek - 1 }) }
	@memoize() get weekEnd() { return this.weekStart.add({ days: this.daysInWeek - 1 }) }
	@memoize() get weekRange() { return new DateTimeRange(this.weekStart, this.weekEnd) }

	@memoize() get monthStart() { return this.with({ day: 1 }) }
	@memoize() get monthEnd() { return this.with({ day: this.daysInMonth }) }
	@memoize() get monthRange() { return new DateTimeRange(this.monthStart, this.monthEnd) }

	@memoize() get yearStart() { return this.with({ month: 1, day: 1 }) }
	@memoize() get yearEnd() { return this.add({ years: 1 }).yearStart.add({ days: -1 }) }
	@memoize() get yearRange() { return new DateTimeRange(this.yearStart, this.yearEnd) }

	equals(comparisonDate: Parameters<Temporal.Instant['equals']>[0] | DateTime) {
		const other = comparisonDate instanceof DateTime ? comparisonDate.temporalInstant : comparisonDate
		return this.temporalInstant.equals(other)
	}

	isBefore(comparisonDate: DateTime) {
		return this.temporalInstant.epochNanoseconds < comparisonDate.temporalInstant.epochNanoseconds
	}

	isAfter(comparisonDate: DateTime) {
		return this.temporalInstant.epochNanoseconds > comparisonDate.temporalInstant.epochNanoseconds
	}

	since(comparisonDate: Parameters<Temporal.Instant['since']>[0] | DateTime = new DateTime) {
		const other = comparisonDate instanceof DateTime ? comparisonDate.temporalInstant : comparisonDate
		const milliseconds = this.temporalInstant.since(other, { largestUnit: 'milliseconds' }).milliseconds
		return new TimeSpan(milliseconds)
	}

	until(comparisonDate: Parameters<Temporal.Instant['until']>[0] | DateTime = new DateTime) {
		const other = comparisonDate instanceof DateTime ? comparisonDate.temporalInstant : comparisonDate
		const milliseconds = this.temporalInstant.until(other, { largestUnit: 'milliseconds' }).milliseconds
		return new TimeSpan(milliseconds)
	}

	add(...parameters: Parameters<Temporal.ZonedDateTime['add']>) {
		return new DateTime(this.zonedDateTime.add(...parameters))
	}

	subtract(...parameters: Parameters<Temporal.ZonedDateTime['subtract']>) {
		return new DateTime(this.zonedDateTime.subtract(...parameters))
	}

	round(...parameters: Parameters<Temporal.ZonedDateTime['round']>) {
		return new DateTime(this.zonedDateTime.round(...parameters))
	}

	with(...parameters: Parameters<Temporal.ZonedDateTime['with']>) {
		return new DateTime(this.zonedDateTime.with(...parameters))
	}

	@memoize() get weekDayNames() {
		return new Array<DateTime>(this.daysInWeek)
			.fill(this.weekStart)
			.map((d, i) => d.add({ days: i }).format({ weekday: 'long' }))
	}

	// @ts-expect-error - toPrimitive relies on the Date prototype
	[Symbol.toPrimitive](hint: 'default' | 'number' | 'string') {
		return this.date[Symbol.toPrimitive](hint)
	}

	valueOf() {
		return this.epochMilliseconds
	}

	format(...parameters: Parameters<Date['format']>) {
		return this.date.format(...parameters)
	}

	formatAsDate(...parameters: Parameters<Date['formatAsDate']>) {
		return this.date.formatAsDate(...parameters)
	}

	formatAsTime(...parameters: Parameters<Date['formatAsTime']>) {
		return this.date.formatAsTime(...parameters)
	}

	formatToParts(...parameters: Parameters<Date['formatToParts']>) {
		return this.date.formatToParts(...parameters)
	}

	toISOString(...parameters: Parameters<Date['toISOString']>) {
		return this.date.toISOString(...parameters)
	}

	toString() {
		return this.format()
	}
}

globalThis.DateTime = DateTime
type DateTimeClass = typeof DateTime
declare global {
	// eslint-disable-next-line
	var DateTime: DateTimeClass
	type DateTime = InstanceType<DateTimeClass>
}