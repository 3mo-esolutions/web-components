import { Temporal, Intl } from '@js-temporal/polyfill'
import { Localizer } from '@3mo/localization'
import { TimeSpan } from './TimeSpan.js'

type DateTimeFromParameters =
	| [epochMilliseconds: number, calendar?: Temporal.CalendarLike, timeZone?: Temporal.TimeZoneLike]
	| [zonedDateTime: Temporal.ZonedDateTime]

export class DateTime extends Date {
	static readonly isoRegularExpression = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

	static from(...parameters: DateTimeFromParameters): DateTime {
		if (parameters.length === 1 && parameters[0] instanceof Temporal.ZonedDateTime) {
			const zonedDateTime = parameters[0]
			return DateTime.from(zonedDateTime.epochMilliseconds, zonedDateTime.getCalendar(), zonedDateTime.getTimeZone())
		}
		const [epochMilliseconds, calendar, timeZone] = parameters
		const dateTime = new DateTime(epochMilliseconds as number)
		// @ts-expect-error Setting readonly property while initialization
		!calendar ? void 0 : dateTime.calendar = Temporal.Calendar.from(calendar)
		// @ts-expect-error Setting readonly property while initialization
		!timeZone ? void 0 : dateTime.timeZone = Temporal.TimeZone.from(timeZone)
		return dateTime
	}

	readonly calendar = Temporal.Calendar.from(Intl.DateTimeFormat(Localizer.currentLanguage).resolvedOptions().calendar)
	readonly timeZone = Temporal.TimeZone.from(Intl.DateTimeFormat(Localizer.currentLanguage).resolvedOptions().timeZone)

	private _temporalInstant?: Temporal.Instant
	get temporalInstant() { return this._temporalInstant ??= new Temporal.Instant(BigInt(this.valueOf() * 1_000_000)) }

	private _zonedDateTime?: Temporal.ZonedDateTime
	get zonedDateTime() { return this._zonedDateTime ??= this.temporalInstant.toZonedDateTime({ calendar: this.calendar, timeZone: this.timeZone }) }

	get era() { return this.zonedDateTime.era }
	get eraYear() { return this.zonedDateTime.eraYear }
	get year() { return this.zonedDateTime.year }
	get month() { return this.zonedDateTime.month }
	get monthCode() { return this.zonedDateTime.monthCode }
	get day() { return this.zonedDateTime.day }
	get hour() { return this.zonedDateTime.hour }
	get minute() { return this.zonedDateTime.minute }
	get second() { return this.zonedDateTime.second }
	get millisecond() { return this.zonedDateTime.millisecond }
	get microsecond() { return this.zonedDateTime.microsecond }
	get nanosecond() { return this.zonedDateTime.nanosecond }
	override get timeZoneId() { return this.zonedDateTime.timeZoneId }
	override get calendarId() { return this.zonedDateTime.calendarId }
	get dayOfWeek() { return this.zonedDateTime.dayOfWeek }
	get dayOfYear() { return this.zonedDateTime.dayOfYear }
	get weekOfYear() { return this.zonedDateTime.weekOfYear }
	get yearOfWeek() { return this.zonedDateTime.yearOfWeek }
	get hoursInDay() { return this.zonedDateTime.hoursInDay }
	get daysInWeek() { return this.zonedDateTime.daysInWeek }
	get daysInMonth() { return this.zonedDateTime.daysInMonth }
	get daysInYear() { return this.zonedDateTime.daysInYear }
	get monthsInYear() { return this.zonedDateTime.monthsInYear }
	get inLeapYear() { return this.zonedDateTime.inLeapYear }
	get offsetNanoseconds() { return this.zonedDateTime.offsetNanoseconds }
	get offset() { return this.zonedDateTime.offset }
	get epochSeconds() { return this.zonedDateTime.epochSeconds }
	get epochMilliseconds() { return this.zonedDateTime.epochMilliseconds }
	get epochMicroseconds() { return this.zonedDateTime.epochMicroseconds }
	get epochNanoseconds() { return this.zonedDateTime.epochNanoseconds }

	get dayStart() { return DateTime.from(this.zonedDateTime.with({ hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 })) }
	get dayEnd() { return DateTime.from(this.zonedDateTime.with({ hour: 23, minute: 59, second: 59, millisecond: 999, microsecond: 999, nanosecond: 999 })) }
	get dayRange() { return new DateTimeRange(this.dayStart, this.dayEnd) }

	get weekStart() { return this.subtract({ days: this.dayOfWeek - 1 }) }
	get weekEnd() { return this.weekStart.add({ days: this.daysInWeek - 1 }) }
	get weekRange() { return new DateTimeRange(this.weekStart, this.weekEnd) }

	get monthStart() { return DateTime.from(this.zonedDateTime.with({ day: 1 })) }
	get monthEnd() { return DateTime.from(this.zonedDateTime.with({ day: this.daysInMonth })) }
	get monthRange() { return new DateTimeRange(this.monthStart, this.monthEnd) }

	get yearStart() { return DateTime.from(this.zonedDateTime.with({ month: 1, day: 1 })) }
	get yearEnd() { return this.add({ years: 1 }).yearStart.add({ days: -1 }) }
	get yearRange() { return new DateTimeRange(this.yearStart, this.yearEnd) }

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

	get weekDayNames() {
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