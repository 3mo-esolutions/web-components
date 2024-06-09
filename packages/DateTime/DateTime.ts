import { Temporal, Intl } from 'temporal-polyfill'
import { Localizer } from '@3mo/localization'
import { TimeSpan } from './TimeSpan.js'
import { type DateTimeParser, DateTimeLocalParser, DateTimeShortcutParser, DateTimeOperationParser, DateTimeNativeParser, DateTimeZeroParser } from './parsers/index.js'
import { Memoize as memoize } from 'typescript-memoize'
import { type ParsingParameters, extractParsingParameters } from './extractParsingParameters.js'

type DateTimeFromParameters =
	| [epochMilliseconds?: number, calendar?: Temporal.CalendarLike, timeZone?: Temporal.TimeZoneLike]
	| [zonedDateTime: Temporal.ZonedDateTime]

export class DateTime extends Date {
	static readonly isoRegularExpression = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

	private static readonly customParsers = new Array<Constructor<DateTimeParser>>()

	static addParser(parser: Constructor<DateTimeParser>) {
		DateTime.customParsers.push(parser)
	}

	@memoize()
	static getResolvedOptions(language = Localizer.currentLanguage) {
		return Intl.DateTimeFormat(language).resolvedOptions()
	}

	@memoize()
	static getCalendar(language = Localizer.currentLanguage) {
		return DateTime.getResolvedOptions(language).calendar
	}

	@memoize()
	static getTimeZone(language = Localizer.currentLanguage) {
		return DateTime.getResolvedOptions(language).timeZone
	}

	@memoize()
	static getDateSeparator(language = Localizer.currentLanguage) {
		return Intl.DateTimeFormat(language)
			.formatToParts(new DateTime)
			.find(part => part.type === 'literal')
			?.value as string
	}

	@memoize()
	static getTimeSeparator(language = Localizer.currentLanguage) {
		return Intl.DateTimeFormat(language, { timeStyle: 'short' })
			.formatToParts(new DateTime)
			.find(part => part.type === 'literal')
			?.value as string
	}

	static parseAsDateTime(...parameters: ParsingParameters) {
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
			...DateTime.customParsers.map(parser => new parser(language)),
		]

		for (const parser of parsers) {
			const dateTime = parser.parse(text, referenceDate)
			if (dateTime) {
				return dateTime
			}
		}

		return undefined
	}

	static from(...parameters: DateTimeFromParameters): DateTime {
		if (parameters.length === 1 && parameters[0] instanceof Temporal.ZonedDateTime) {
			const zonedDateTime = parameters[0]
			return DateTime.from(zonedDateTime.epochMilliseconds, zonedDateTime.getCalendar(), zonedDateTime.getTimeZone())
		}
		const [epochMilliseconds, calendar, timeZone] = parameters
		const dateTime = typeof epochMilliseconds === 'number' ? new DateTime(epochMilliseconds) : new DateTime
		// @ts-expect-error Setting readonly property while initialization
		!calendar ? void 0 : dateTime.calendar = Temporal.Calendar.from(calendar)
		// @ts-expect-error Setting readonly property while initialization
		!timeZone ? void 0 : dateTime.timeZone = Temporal.TimeZone.from(timeZone)
		return dateTime
	}

	readonly calendar = Temporal.Calendar.from(DateTime.getCalendar())
	readonly timeZone = Temporal.TimeZone.from(DateTime.getTimeZone())

	@memoize() get temporalInstant() { return Temporal.Instant.fromEpochMilliseconds(this.valueOf()) }

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
	@memoize() override get timeZoneId() { return this.zonedDateTime.timeZoneId }
	@memoize() override get calendarId() { return this.zonedDateTime.calendarId }
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

	@memoize() get dayStart() { return DateTime.from(this.zonedDateTime.startOfDay()) }
	@memoize() get dayEnd() { return DateTime.from(this.zonedDateTime.add({ days: 1 }).startOfDay().add({ nanoseconds: -1 })) }
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
		return DateTime.from(this.zonedDateTime.add(...parameters))
	}

	subtract(...parameters: Parameters<Temporal.ZonedDateTime['subtract']>) {
		return DateTime.from(this.zonedDateTime.subtract(...parameters))
	}

	round(...parameters: Parameters<Temporal.ZonedDateTime['round']>) {
		return DateTime.from(this.zonedDateTime.round(...parameters))
	}

	with(...parameters: Parameters<Temporal.ZonedDateTime['with']>) {
		return DateTime.from(this.zonedDateTime.with(...parameters))
	}

	@memoize() get weekDayNames() {
		return new Array<DateTime>(this.daysInWeek)
			.fill(this.weekStart)
			.map((d, i) => d.add({ days: i }).format({ weekday: 'long' }))
	}
}

globalThis.DateTime = DateTime
type DateTimeClass = typeof DateTime
declare global {
	// eslint-disable-next-line
	var DateTime: DateTimeClass
	type DateTime = InstanceType<DateTimeClass>
}