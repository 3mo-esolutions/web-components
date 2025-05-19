export type FieldDateTimePrecisionKey = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

export class FieldDateTimePrecision {
	private static readonly container = new Array<FieldDateTimePrecision>()

	static parse(value?: string): FieldDateTimePrecision | undefined {
		return !value ? undefined : this.container.find(precision => precision.key === value)
	}

	static readonly Year = new FieldDateTimePrecision(1, 'year')
	// static readonly Week = new FieldDateTimePrecision(2, 'week')
	static readonly Month = new FieldDateTimePrecision(3, 'month')
	static readonly Day = new FieldDateTimePrecision(4, 'day')
	static readonly Hour = new FieldDateTimePrecision(5, 'hour')
	static readonly Minute = new FieldDateTimePrecision(6, 'minute')
	static readonly Second = new FieldDateTimePrecision(7, 'second')

	private constructor(readonly value: number, readonly key: FieldDateTimePrecisionKey) {
		FieldDateTimePrecision.container.push(this)
	}

	private isSmallerThan(other: FieldDateTimePrecision): boolean {
		return this.value < other.value
	}

	get formatOptions(): Intl.DateTimeFormatOptions {
		return {
			year: 'numeric',
			month: this.isSmallerThan(FieldDateTimePrecision.Month) ? undefined : '2-digit',
			day: this.isSmallerThan(FieldDateTimePrecision.Day) ? undefined : '2-digit',
			hour: this.isSmallerThan(FieldDateTimePrecision.Hour) ? undefined : '2-digit',
			minute: this.isSmallerThan(FieldDateTimePrecision.Minute) ? undefined : '2-digit',
			second: this.isSmallerThan(FieldDateTimePrecision.Second) ? undefined : '2-digit',
			hourCycle: 'h23',
		}
	}

	getRange(date: DateTime) {
		const start = date.with({
			year: date.year,
			month: this.isSmallerThan(FieldDateTimePrecision.Month) ? 1 : date.month,
			day: this.isSmallerThan(FieldDateTimePrecision.Day) ? 1 : date.day,
			hour: this.isSmallerThan(FieldDateTimePrecision.Hour) ? 0 : date.hour,
			minute: this.isSmallerThan(FieldDateTimePrecision.Minute) ? 0 : date.minute,
			second: this.isSmallerThan(FieldDateTimePrecision.Second) ? 0 : date.second,
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