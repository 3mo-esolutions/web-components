import { LanguageCode, Localizer, extractDateTimeFormatOptions } from '@3mo/localization'

export class DateTimeRange {
	static parse(dateRange: string) {
		const probableUntilDelimiters = new Set(['–', '–', '~', DateTimeRange.getUntilDelimiter()])
		const [start, end] = dateRange.split(new RegExp(`[${[...probableUntilDelimiters].join('')}]+`))
		return new DateTimeRange(
			start ? new Date(start) : undefined,
			end ? new Date(end) : undefined
		)
	}

	private static getUntilDelimiter(language: LanguageCode = Localizer.currentLanguage) {
		const parts = Intl.DateTimeFormat(language).formatRangeToParts(
			new Date('2010-01-01T00:00:00.000Z'),
			new Date('2020-01-01T00:00:00.000Z')
		)
		return parts.find(part => part.source === 'shared')?.value
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

	format(options?: Intl.DateTimeFormatOptions & { readonly language?: LanguageCode }) {
		if (!this.start && !this.end) {
			return ''
		}

		const [language, opt] = extractDateTimeFormatOptions(this.calendarId, this.timeZoneId, options, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		})

		if (!this.end) {
			const start = this.start as Date
			return start.formatAsDate(options) + DateTimeRange.getUntilDelimiter(language)?.trimEnd()
		}

		if (!this.start) {
			const end = this.end as Date
			return DateTimeRange.getUntilDelimiter(language)?.trimStart() + end.formatAsDate(options)
		}

		return Intl.DateTimeFormat(language, opt).formatRange(this.start, this.end)
	}
}

globalThis.DateTimeRange = DateTimeRange
type DateTimeRangeClass = typeof DateTimeRange
declare global {
	// eslint-disable-next-line
	var DateTimeRange: DateTimeRangeClass
	type DateTimeRange = InstanceType<DateTimeRangeClass>
}