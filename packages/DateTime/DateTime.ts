import { Localizer } from '@3mo/localization'
import { Temporal } from 'temporal-polyfill'
import { TimeSpan } from './TimeSpan.js'

export class DateTime extends Date {
	static readonly isoRegularExpression = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

	static getWeekDayNames(language = Localizer.currentLanguage) {
		return new Array<DateTime>(7)
			.fill(new DateTime().weekRange.start as DateTime)
			.map((d, i) => d.addDays(i).format({ language, weekday: 'long' }))
	}

	static fromEpochNanoseconds(epochNanoseconds: bigint) {
		return new DateTime(Number(epochNanoseconds / BigInt(1_000_000)))
	}

	private _temporalInstant?: Temporal.Instant
	get temporalInstant() {
		return this._temporalInstant ??= new Temporal.Instant(BigInt(this.valueOf() * 1_000_000))
	}

	private _zonedDateTime?: Temporal.ZonedDateTime
	get zonedDateTime() {
		return this._zonedDateTime ??= this.temporalInstant.toZonedDateTime({
			calendar: Intl.DateTimeFormat().resolvedOptions().calendar,
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		})
	}

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
		return DateTime.fromEpochNanoseconds(this.zonedDateTime.add(...parameters).epochNanoseconds)
	}

	subtract(...parameters: Parameters<Temporal.ZonedDateTime['subtract']>) {
		return DateTime.fromEpochNanoseconds(this.zonedDateTime.subtract(...parameters).epochNanoseconds)
	}

	round(...parameters: Parameters<Temporal.ZonedDateTime['round']>) {
		return DateTime.fromEpochNanoseconds(this.zonedDateTime.round(...parameters).epochNanoseconds)
	}

	get day() {
		return this.getDate()
	}

	addDays(days: number) {
		return this.add({ days })
	}

	get dayOfWeek() {
		return this.zonedDateTime.dayOfWeek
	}

	get weekOfYear() {
		return this.zonedDateTime.weekOfYear
	}

	get weekRange() {
		const weekStart = this.addDays(1 - this.zonedDateTime.dayOfWeek)
		const weekEnd = weekStart.addDays(this.zonedDateTime.daysInWeek - 1)
		return new DateTimeRange(weekStart, weekEnd)
	}

	get weekStart() {
		return this.weekRange.start
	}

	get weekEnd() {
		return this.weekRange.end
	}

	addWeeks(weeks: number) {
		return this.add({ weeks })
	}

	static get monthNames() {
		return new Array<DateTime>(12)
			.fill(new DateTime().yearStart)
			.map((d, i) => d.addMonths(i).format({ month: 'long' }))
	}

	get month() {
		return this.getMonth()
	}

	get localMonth() {
		return Number(new Intl.DateTimeFormat(Localizer.currentLanguage, { month: 'numeric', numberingSystem: 'latn' }).format(this))
	}

	get monthName() {
		return DateTime.monthNames[this.month]
	}

	get monthRange() {
		const start = new DateTime(this.year, this.month, 1)
		const dayDifference = Number(new Intl.DateTimeFormat(Localizer.currentLanguage, { day: 'numeric', numberingSystem: 'latn' }).format(start)) - 1
		const startDay = start.addDays(-dayDifference)
		const endDay = startDay.addMonths(1).addDays(-1)
		return new DateTimeRange(startDay, endDay)
	}

	get monthStart() {
		return this.monthRange.start
	}

	get monthEnd() {
		return this.monthRange.end
	}

	addMonths(months: number) {
		return this.add({ months })
	}

	addYears(years: number) {
		return this.add({ years })
	}

	get year() {
		return this.getFullYear()
	}

	get yearStart() {
		return new DateTime(this.year, 0, 1)
	}

	get yearEnd() {
		return new DateTime(this.year + 1, 0, 1).addDays(-1)
	}

	get yearNames() {
		return new Array<DateTime | undefined>(12)
			.fill(undefined)
			.map((_, i) => new Date(Date.UTC(this.year, i, 1, 0, 0, 0)).format({ year: 'numeric', numberingSystem: 'latn' }))
	}

	get yearName() {
		return this.yearNames[this.month]
	}
}

globalThis.DateTime = DateTime
type DateTimeClass = typeof DateTime
declare global {
	// eslint-disable-next-line
	var DateTime: DateTimeClass
	type DateTime = InstanceType<DateTimeClass>
}