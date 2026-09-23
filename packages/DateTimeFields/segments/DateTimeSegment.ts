import { type EditableSegment, type LiteralSegment } from '@3mo/segmented-input'

export type DateTimeSegmentType = 'era' | 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'dayPeriod' | 'literal'

export const editableDateTimeSegmentTypes = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'dayPeriod'] as const

export type EditableDateTimeSegmentType = typeof editableDateTimeSegmentTypes[number]

export function isEditableDateTimeSegmentType(type: DateTimeSegmentType): type is EditableDateTimeSegmentType {
	return (editableDateTimeSegmentTypes as ReadonlyArray<DateTimeSegmentType>).includes(type)
}

/** One unit of a date or time as the field renders it, or a literal separator between two of them. */
export type DateTimeSegment = DateTimeLiteralSegment | EditableDateTimeSegment

export interface DateTimeLiteralSegment extends LiteralSegment {
	readonly type: DateTimeSegmentType
}

export interface EditableDateTimeSegment extends EditableSegment {
	readonly type: EditableDateTimeSegmentType
	/** The unit's numeric value, in the numbers the user sees (a 12-hour clock reports 1–12). */
	readonly value?: number
	readonly min?: number
	readonly max?: number
	/** What assistive technology reads for the value where the number alone is not enough (month names, "2 PM"). */
	readonly valueText?: string
}