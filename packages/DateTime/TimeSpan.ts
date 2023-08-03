import { LanguageCode, Localizer } from '@3mo/localization'

export class TimeSpan {
	static readonly ticksPerSecond = 1000
	static readonly ticksPerMinute = TimeSpan.ticksPerSecond * 60
	static readonly ticksPerHour = TimeSpan.ticksPerMinute * 60
	static readonly ticksPerDay = TimeSpan.ticksPerHour * 24
	static readonly ticksPerWeek = TimeSpan.ticksPerDay * 7
	static readonly ticksPerMonths = TimeSpan.ticksPerDay * 30
	static readonly ticksPerYear = TimeSpan.ticksPerDay * 365

	static get zero() { return new TimeSpan(0) }
	static fromMilliseconds(milliseconds: number) { return new TimeSpan(milliseconds) }
	static fromSeconds(seconds: number) { return new TimeSpan(seconds * TimeSpan.ticksPerSecond) }
	static fromMinutes(minutes: number) { return new TimeSpan(minutes * TimeSpan.ticksPerMinute) }
	static fromHours(hours: number) { return new TimeSpan(hours * TimeSpan.ticksPerHour) }
	static fromDays(days: number) { return new TimeSpan(days * TimeSpan.ticksPerDay) }
	static fromWeeks(weeks: number) { return new TimeSpan(weeks * TimeSpan.ticksPerWeek) }
	static fromMonths(months: number) { return new TimeSpan(months * TimeSpan.ticksPerMonths) }
	static fromYears(years: number) { return new TimeSpan(years * TimeSpan.ticksPerYear) }

	constructor(readonly milliseconds: number) { }

	get seconds() { return this.milliseconds / TimeSpan.ticksPerSecond }
	get minutes() { return this.milliseconds / TimeSpan.ticksPerMinute }
	get hours() { return this.milliseconds / TimeSpan.ticksPerHour }
	get days() { return this.milliseconds / TimeSpan.ticksPerDay }
	get weeks() { return this.milliseconds / TimeSpan.ticksPerWeek }
	get months() { return this.milliseconds / TimeSpan.ticksPerMonths }
	get years() { return this.milliseconds / TimeSpan.ticksPerYear }

	valueOf() { return this.milliseconds }

	toString() { return this.format() }

	format(options?: Intl.RelativeTimeFormatOptions & { readonly language?: LanguageCode }) {
		const { language, ...explicitOptions } = options ?? {}
		const formatter = new Intl.RelativeTimeFormat(
			language ?? Localizer.currentLanguage,
			explicitOptions ?? { style: 'long', numeric: 'auto' }
		)
		const format = (value: number, unit: Intl.RelativeTimeFormatUnit) => formatter.format(Math.sign(value) * Math.floor(Math.abs(value)), unit)
		switch (true) {
			case Math.abs(this.years) >= 1:
				return format(this.years, 'years')
			case Math.abs(this.months) >= 1:
				return format(this.months, 'months')
			case Math.abs(this.weeks) >= 1:
				return format(this.weeks, 'weeks')
			case Math.abs(this.days) >= 1:
				return format(this.days, 'days')
			case Math.abs(this.hours) >= 1:
				return format(this.hours, 'hours')
			case Math.abs(this.minutes) >= 1:
				return format(this.minutes, 'minutes')
			default:
				return format(this.seconds, 'seconds')
		}
	}
}


globalThis.TimeSpan = TimeSpan
type TimeSpanClass = typeof TimeSpan
declare global {
	// eslint-disable-next-line
	var TimeSpan: TimeSpanClass
	type TimeSpan = InstanceType<TimeSpanClass>
}