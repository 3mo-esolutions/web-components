import { DateTimeParser } from './DateTimeParser.js'

type DatePart = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

type DatePartInfo = {
	readonly minLength: number
	readonly maxLength: number
	readonly group: 'date' | 'time'
	readonly optional: boolean
}

const infoByPart = new Map<DatePart, DatePartInfo>([
	['year', { minLength: 4, maxLength: 4, group: 'date', optional: true }],
	['month', { minLength: 1, maxLength: 2, group: 'date', optional: false }],
	['day', { minLength: 1, maxLength: 2, group: 'date', optional: false }],
	['hour', { minLength: 1, maxLength: 2, group: 'time', optional: true }],
	['minute', { minLength: 1, maxLength: 2, group: 'time', optional: true }],
	['second', { minLength: 1, maxLength: 2, group: 'time', optional: true }],
])

export class DateTimeLocalParser extends DateTimeParser {
	private static readonly whiteSpaceRegex = /\s/g

	private readonly dateSeparator = DateTime.getDateSeparator(this.language)
	private readonly timeSeparator = DateTime.getTimeSeparator(this.language)
	private readonly calendar = DateTime.getCalendar(this.language)
	private readonly timeZone = DateTime.getTimeZone(this.language)

	private readonly order = new DateTime({ calendar: this.calendar, timeZone: this.timeZone })
		.formatToParts(this.language, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })
		.filter(x => x.type !== 'literal')
		.map(x => ({ type: x.type, ...infoByPart.get(x.type as DatePart) }) as const)

	private readonly splitterRegex = new RegExp('^' + this.order.map((part, index, parts) => {
		index
		const { type, minLength, maxLength, group, optional } = part

		const partsInGroup = parts.filter(x => x.group === part.group)
		const firstInGroup = partsInGroup.indexOf(part) === 0
		const lastInGroup = partsInGroup.indexOf(part) === partsInGroup.length - 1

		const partSeparator = group === 'date' ? this.dateSeparator : this.timeSeparator

		// In the date group, it is important in which capture group the separators are placed
		// as the order of the capture groups is important for the parse method
		const yearComesBeforeDay = parts.findIndex(x => x.type === 'year') < parts.findIndex(x => x.type === 'day')

		if (yearComesBeforeDay && group === 'date') {
			const separator = lastInGroup ? '' : '\\' + partSeparator
			return `(:?(?<${type}>\\d{${minLength},${maxLength}})${separator})${optional ? '?' : ''}`
		} else {
			const separator = firstInGroup ? '' : '\\' + partSeparator
			return `(${separator}:?(?<${type}>\\d{${minLength},${maxLength}}))${optional ? '?' : ''}`
		}
	}).join('') + '$')

	parse(text: string, referenceDate?: DateTime) {
		text = text.replace(DateTimeLocalParser.whiteSpaceRegex, '')

		const partValues = this.splitterRegex.exec(text)?.groups as { [key in DatePart]?: string } | undefined

		if (!partValues) {
			return undefined
		}

		const getValueOf = (part: DatePart) => {
			const value = partValues[part]
			return !value ? undefined : parseInt(value)
		}

		referenceDate ??= new DateTime({ calendar: this.calendar, timeZone: this.timeZone })

		return referenceDate.with({
			year: getValueOf('year') ?? referenceDate.year,
			month: getValueOf('month') ?? 0,
			day: getValueOf('day') ?? 0,
			hour: getValueOf('hour') ?? referenceDate.hour,
			minute: getValueOf('minute') ?? referenceDate.minute,
			second: getValueOf('second') ?? referenceDate.second,
		})
	}
}