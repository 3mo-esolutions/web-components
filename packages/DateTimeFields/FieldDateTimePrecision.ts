export type FieldDateTimePrecisionKey = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

export class FieldDateTimePrecision {
	private static readonly _all = new Array<FieldDateTimePrecision>()
	static get all() { return FieldDateTimePrecision._all as ReadonlyArray<FieldDateTimePrecision> }

	static parse(value?: string): FieldDateTimePrecision | undefined {
		return !value ? undefined : this._all.find(precision => precision.key === value)
	}

	static readonly Year = new FieldDateTimePrecision(1, 'year')
	// static readonly Week = new FieldDateTimePrecision(2, 'week')
	static readonly Month = new FieldDateTimePrecision(3, 'month')
	static readonly Day = new FieldDateTimePrecision(4, 'day')
	static readonly Hour = new FieldDateTimePrecision(5, 'hour')
	static readonly Minute = new FieldDateTimePrecision(6, 'minute')
	static readonly Second = new FieldDateTimePrecision(7, 'second')

	private constructor(readonly value: number, readonly key: FieldDateTimePrecisionKey) {
		FieldDateTimePrecision._all.push(this)
	}

	get formatOptions(): Intl.DateTimeFormatOptions {
		return {
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

	valueOf() {
		return this.value
	}

	toString() {
		return this.key
	}
}