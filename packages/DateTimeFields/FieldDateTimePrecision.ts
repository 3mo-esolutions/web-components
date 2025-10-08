export type FieldDateTimePrecisionKey = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

export class FieldDateTimePrecision {
	private static readonly _all = new Array<FieldDateTimePrecision>()
	static get all() { return FieldDateTimePrecision._all as ReadonlyArray<FieldDateTimePrecision> }

	static parse(value?: string): FieldDateTimePrecision | undefined {
		return !value ? undefined : this._all.find(precision => precision.key === value)
	}

	static readonly Year = new FieldDateTimePrecision(1, 'year')
	static readonly Month = new FieldDateTimePrecision(2, 'month')
	static readonly Week = new FieldDateTimePrecision(3, 'week')
	static readonly Day = new FieldDateTimePrecision(4, 'day')
	static readonly Hour = new FieldDateTimePrecision(5, 'hour')
	static readonly Minute = new FieldDateTimePrecision(6, 'minute')
	static readonly Second = new FieldDateTimePrecision(7, 'second')

	private constructor(readonly value: number, readonly key: FieldDateTimePrecisionKey) {
		FieldDateTimePrecision._all.push(this)
	}

	get formatOptions(): Intl.DateTimeFormatOptions {
		return this === FieldDateTimePrecision.Week ? { week: 'medium' } as any : {
			year: 'numeric',
			month: this < FieldDateTimePrecision.Month ? undefined : '2-digit',
			day: this < FieldDateTimePrecision.Day ? undefined : '2-digit',
			hour: this < FieldDateTimePrecision.Hour ? undefined : '2-digit',
			minute: this < FieldDateTimePrecision.Minute ? undefined : '2-digit',
			second: this < FieldDateTimePrecision.Second ? undefined : '2-digit',
			hourCycle: 'h23',
		}
	}

	getRange(date: DateTime) {
		if (this === FieldDateTimePrecision.Week) {
			return date.weekRange
		}
		const start = date.with({
			year: date.year,
			month: this < FieldDateTimePrecision.Month ? 1 : date.month,
			day: this < FieldDateTimePrecision.Day ? 1 : date.day,
			hour: this < FieldDateTimePrecision.Hour ? 0 : date.hour,
			minute: this < FieldDateTimePrecision.Minute ? 0 : date.minute,
			second: this < FieldDateTimePrecision.Second ? 0 : date.second,
		})
		return new DateTimeRange(start, start.add({ [`${this.key}s`]: 1 }).subtract({ seconds: 1 }))
	}

	equals(left: DateTime, right: DateTime): boolean {
		if (this === FieldDateTimePrecision.Week) {
			return left.yearOfWeek === right.yearOfWeek && left.weekOfYear === right.weekOfYear
		}

		return left.year === right.year
			&& (this < FieldDateTimePrecision.Month || left.month === right.month)
			&& (this < FieldDateTimePrecision.Day || left.day === right.day)
			&& (this < FieldDateTimePrecision.Hour || left.hour === right.hour)
			&& (this < FieldDateTimePrecision.Minute || left.minute === right.minute)
			&& (this < FieldDateTimePrecision.Second || left.second === right.second)
	}

	isSmallerThan(left: DateTime, right: DateTime): boolean {
		if (this === FieldDateTimePrecision.Week) {
			return (left.yearOfWeek ?? 0) < (right.yearOfWeek ?? 0)
				|| (left.yearOfWeek === right.yearOfWeek && (left.weekOfYear ?? 0) < (right.weekOfYear ?? 0))
		}

		return left.year < right.year
			|| (this >= FieldDateTimePrecision.Month && left.year === right.year && left.month < right.month)
			|| (this >= FieldDateTimePrecision.Day && left.year === right.year && left.month === right.month && left.day < right.day)
			|| (this >= FieldDateTimePrecision.Hour && left.year === right.year && left.month === right.month && left.day === right.day && left.hour < right.hour)
			|| (this >= FieldDateTimePrecision.Minute && left.year === right.year && left.month === right.month && left.day === right.day && left.hour === right.hour && left.minute < right.minute)
			|| (this >= FieldDateTimePrecision.Second && left.year === right.year && left.month === right.month && left.day === right.day && left.hour === right.hour && left.minute === right.minute && left.second < right.second)
	}

	valueOf() {
		return this.value
	}

	toString() {
		return this.key
	}
}