import { DirectionsByLanguage, LocalizableString, Localizer, type LanguageCode } from '@3mo/localization'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { type DateTimeSegment, type DateTimeSegmentType, type EditableDateTimeSegmentType, isEditableDateTimeSegmentType } from './DateTimeSegment.js'

export type HourCycle = 'h11' | 'h12' | 'h23' | 'h24'

const hourCycles: ReadonlyArray<HourCycle> = ['h11', 'h12', 'h23', 'h24']

/** Reads an `hourCycle` attribute, ignoring anything which is not one of the four cycles. */
export const hourCycleConverter = (value: unknown) => hourCycles.includes(value as HourCycle) ? value as HourCycle : undefined

export type DateTimeSegmenterOptions = {
	readonly precision: FieldDateTimePrecision
	readonly language?: LanguageCode
	readonly calendar?: string
	readonly timeZone?: string
	readonly hourCycle?: HourCycle
	/** Renders only the time units, for time-only fields. */
	readonly timeOnly?: boolean
}

const yearLimit = 9999
const placeholderWidths: Partial<Record<EditableDateTimeSegmentType, number>> = { year: 4, month: 2, week: 2, day: 2 }
const timePlaceholder = '--'

/**
 * Derives the segments of a date-time value for a language, calendar and precision from
 * `Intl.DateTimeFormat.formatToParts`, and edits them with Temporal's calendar arithmetic.
 */
export class DateTimeSegmenter {
	static readonly pageSteps: Partial<Record<EditableDateTimeSegmentType, number>> = { year: 5, month: 2, week: 4, day: 7, hour: 2, minute: 15, second: 15 }

	static defaultHourCycle(language: LanguageCode): HourCycle {
		return (new Intl.DateTimeFormat(language, { hour: 'numeric' }).resolvedOptions().hourCycle ?? 'h23') as HourCycle
	}

	readonly precision: FieldDateTimePrecision
	readonly language: LanguageCode
	readonly calendar: string
	readonly timeZone: string
	readonly hourCycle: HourCycle
	readonly timeOnly: boolean
	readonly direction: 'ltr' | 'rtl'
	readonly formatOptions: Intl.DateTimeFormatOptions
	readonly formatter: Intl.DateTimeFormat

	private readonly displayNames?: Intl.DisplayNames
	private readonly digits: string
	private readonly dayPeriods: readonly [am: string, pm: string]
	private readonly monthFormatter: Intl.DateTimeFormat
	private readonly hourFormatter: Intl.DateTimeFormat

	constructor(options: DateTimeSegmenterOptions) {
		this.precision = options.precision
		this.language = options.language ?? Localizer.languages.current
		this.calendar = options.calendar ?? DateTime.getCalendar(this.language)
		this.timeZone = options.timeZone ?? DateTime.getTimeZone(this.language)
		this.hourCycle = options.hourCycle ?? DateTimeSegmenter.defaultHourCycle(this.language)
		this.timeOnly = options.timeOnly ?? false
		this.direction = DirectionsByLanguage.get(this.language)
		this.formatOptions = this.buildFormatOptions()
		this.formatter = new Intl.DateTimeFormat(this.language, this.formatOptions)
		this.monthFormatter = new Intl.DateTimeFormat(this.language, { month: 'long', calendar: this.calendar, timeZone: this.timeZone })
		this.hourFormatter = new Intl.DateTimeFormat(this.language, { hour: 'numeric', hourCycle: this.hourCycle, timeZone: this.timeZone })
		try {
			this.displayNames = new Intl.DisplayNames(this.language, { type: 'dateTimeField' })
		} catch {
			this.displayNames = undefined
		}
		const numberFormat = new Intl.NumberFormat(this.language, { useGrouping: false })
		this.digits = Array.from({ length: 10 }, (_, digit) => numberFormat.format(digit)).join('')
		const dayPeriodOf = (hour: number) => new Intl.DateTimeFormat(this.language, { hour: 'numeric', hour12: true, timeZone: 'UTC' })
			.formatToParts(new Date(Date.UTC(2026, 0, 1, hour)))
			.find(part => part.type === 'dayPeriod')?.value ?? ''
		this.dayPeriods = [dayPeriodOf(9), dayPeriodOf(21)]
	}

	/** Identifies the configuration, so a consumer can tell when its segmenter is stale. */
	get key() {
		return [this.precision.key, this.language, this.calendar, this.timeZone, this.hourCycle, this.timeOnly].join('|')
	}

	get twelveHours() {
		return this.hourCycle === 'h11' || this.hourCycle === 'h12'
	}

	private buildFormatOptions(): Intl.DateTimeFormatOptions {
		const precision = this.precision === FieldDateTimePrecision.Week ? FieldDateTimePrecision.Day : this.precision
		const options: Intl.DateTimeFormatOptions = { ...precision.formatOptions, calendar: this.calendar, timeZone: this.timeZone }
		if (this.timeOnly) {
			delete options.year
			delete options.month
			delete options.day
		}
		if (options.hour !== undefined) {
			options.hourCycle = this.hourCycle
		}
		return options
	}

	/** Brings a date into this segmenter's calendar and time zone. */
	adopt(date: DateTime) {
		return date.calendarId === this.calendar && date.timeZoneId === this.timeZone
			? date
			: DateTime.from(date.valueOf(), this.calendar, this.timeZone)
	}

	/** The editable unit types present, in rendering order. */
	get types(): ReadonlyArray<EditableDateTimeSegmentType> {
		return this.parts(new DateTime).map(part => part.type).filter(isEditableDateTimeSegmentType)
	}

	segments(date: DateTime, filled: ReadonlySet<EditableDateTimeSegmentType>): Array<DateTimeSegment> {
		date = this.adopt(date)
		let literals = 0
		return this.parts(date).map(part => {
			if (!isEditableDateTimeSegmentType(part.type)) {
				// A key identifies a segment within its group, and a date has several literals.
				return { key: part.type === 'literal' ? `literal-${literals++}` : part.type, type: part.type, editable: false, text: part.value }
			}
			const type = part.type
			const isFilled = filled.has(type)
			const placeholder = this.placeholderOf(type)
			const label = this.labelOf(type)
			const limits = this.limits(date, type)
			return {
				key: type,
				type,
				editable: true,
				filled: isFilled,
				text: isFilled ? part.value : placeholder,
				label,
				// As many digits as the largest value takes, so that typing moves on once it cannot grow.
				capacity: type === 'dayPeriod' ? 1 : String(limits.max).length,
				inputMode: type === 'dayPeriod' ? undefined : 'numeric',
				...limits,
				value: this.valueOf(date, type),
				valueText: this.valueTextOf(date, type, part.value),
			}
		})
	}

	private parts(date: DateTime): Array<{ type: DateTimeSegmentType, value: string }> {
		if (this.precision === FieldDateTimePrecision.Week) {
			return [
				{ type: 'year', value: (date.yearOfWeek ?? date.year).format(this.language) },
				{ type: 'literal', value: ` ${LocalizableString.get('✂Week').localize(this.language)}` },
				{ type: 'week', value: (date.weekOfYear ?? 1).format(this.language).padStart(2, this.digits[0]) },
			]
		}
		return this.formatter.formatToParts(date).map(part => ({ type: this.typeOf(part.type), value: part.value }))
	}

	private typeOf(partType: string): DateTimeSegmentType {
		switch (partType) {
			case 'relatedYear':
				return 'year'
			case 'year':
			case 'month':
			case 'day':
			case 'hour':
			case 'minute':
			case 'second':
			case 'dayPeriod':
			case 'era':
				return partType
			default:
				return 'literal'
		}
	}

	labelOf(type: EditableDateTimeSegmentType) {
		return this.displayNames?.of(type === 'week' ? 'weekOfYear' : type) ?? type
	}

	private placeholderOf(type: EditableDateTimeSegmentType) {
		const width = placeholderWidths[type]
		if (!width) {
			return timePlaceholder
		}
		const word = this.labelOf(type)
		return /^\p{Script=Latin}/u.test(word) ? word[0]!.toLocaleLowerCase(this.language).repeat(width) : word
	}

	limits(date: DateTime, type: EditableDateTimeSegmentType): { min: number, max: number } {
		date = this.adopt(date)
		switch (type) {
			case 'year': return { min: 1, max: yearLimit }
			case 'month': return { min: 1, max: date.monthsInYear }
			case 'week': return { min: 1, max: DateTimeSegmenter.weeksInYear(date) }
			case 'day': return { min: 1, max: date.daysInMonth }
			case 'hour': return this.hourCycle === 'h12' ? { min: 1, max: 12 } : this.hourCycle === 'h11' ? { min: 0, max: 11 } : { min: 0, max: 23 }
			case 'minute':
			case 'second': return { min: 0, max: 59 }
			case 'dayPeriod': return { min: 0, max: 1 }
		}
	}

	private static weeksInYear(date: DateTime) {
		const lastWeek = date.with({ month: date.monthsInYear, day: 28 }).weekOfYear ?? 52
		return lastWeek === 1 ? 52 : lastWeek
	}

	valueOf(date: DateTime, type: EditableDateTimeSegmentType): number {
		date = this.adopt(date)
		switch (type) {
			case 'year': return date.eraYear ?? date.year
			case 'month': return date.month
			case 'week': return date.weekOfYear ?? 1
			case 'day': return date.day
			case 'hour': return this.hourCycle === 'h12' ? (date.hour % 12 || 12) : this.hourCycle === 'h11' ? date.hour % 12 : date.hour
			case 'minute': return date.minute
			case 'second': return date.second
			case 'dayPeriod': return date.hour >= 12 ? 1 : 0
		}
	}

	private valueTextOf(date: DateTime, type: EditableDateTimeSegmentType, text: string) {
		switch (type) {
			case 'month':
				return this.monthFormatter.format(date)
			case 'hour':
				return this.hourFormatter.format(date)
			default:
				return text
		}
	}

	set(date: DateTime, type: EditableDateTimeSegmentType, value: number): DateTime {
		date = this.adopt(date)
		switch (type) {
			case 'year':
				return date.era !== undefined && date.eraYear !== undefined
					? date.with({ era: date.era, eraYear: value })
					: date.with({ year: value })
			case 'month':
				return date.with({ month: value })
			case 'week':
				return date.add({ weeks: value - (date.weekOfYear ?? value) })
			case 'day':
				return date.with({ day: value })
			case 'hour': {
				const afternoon = date.hour >= 12
				const hour = this.twelveHours ? (value % 12) + (afternoon ? 12 : 0) : value % 24
				return date.with({ hour })
			}
			case 'minute':
				return date.with({ minute: value })
			case 'second':
				return date.with({ second: value })
			case 'dayPeriod': {
				const afternoon = date.hour >= 12
				return value >= 1 === afternoon ? date : date.with({ hour: afternoon ? date.hour - 12 : date.hour + 12 })
			}
		}
	}

	/** Moves a unit by `delta`, wrapping at its limits — except the year, which is clamped. */
	step(date: DateTime, type: EditableDateTimeSegmentType, delta: number): DateTime {
		date = this.adopt(date)
		const { min, max } = this.limits(date, type)
		const current = this.valueOf(date, type)
		const span = max - min + 1
		const next = type === 'year'
			? Math.min(max, Math.max(min, current + delta))
			: ((((current - min + delta) % span) + span) % span) + min
		return this.set(date, type, next)
	}

	/** The numeric value of a typed character in the language's numbering system or ASCII, if it is a digit. */
	digitOf(character: string): number | undefined {
		const index = this.digits.indexOf(character)
		if (index >= 0) {
			return index
		}
		return /^[0-9]$/.test(character) ? Number(character) : undefined
	}

	/** Which day period a typed character selects, matching the first character of the localized "AM"/"PM". */
	dayPeriodOf(character: string): 0 | 1 | undefined {
		const matches = (period: string) => !!period && period.localeCompare(character, this.language, { sensitivity: 'base' }) === 0
			|| period.toLocaleLowerCase(this.language).startsWith(character.toLocaleLowerCase(this.language))
		if (matches(this.dayPeriods[0])) {
			return 0
		}
		if (matches(this.dayPeriods[1])) {
			return 1
		}
		return undefined
	}

	/** The whole value as one localized string, for the group's accessible description. */
	describe(date: DateTime) {
		date = this.adopt(date)
		return this.precision === FieldDateTimePrecision.Week
			? date.format(this.language, { week: 'medium' })
			: this.formatter.format(date)
	}
}