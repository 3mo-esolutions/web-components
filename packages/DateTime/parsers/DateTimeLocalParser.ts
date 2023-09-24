import { DateTimeParser } from './DateTimeParser.js'

type DatePart = 'year' | 'month' | 'day'

const infoByPart = new Map<DatePart, { minLength: number, maxLength: number, optional: boolean }>([
	['year', { minLength: 4, maxLength: 4, optional: true }],
	['month', { minLength: 1, maxLength: 2, optional: false }],
	['day', { minLength: 1, maxLength: 2, optional: false }],
])

export class DateTimeLocalParser extends DateTimeParser {
	private static readonly whiteSpaceRegex = /\s/g

	private readonly separator = DateTime.getDateSeparator(this.language)
	private readonly calendar = DateTime.getCalendar(this.language)
	private readonly timeZone = DateTime.getTimeZone(this.language)

	private readonly order = DateTime.from(undefined, this.calendar, this.timeZone)
		.formatToParts({ language: this.language, year: 'numeric', month: 'numeric', day: 'numeric' })
		.filter(x => x.type !== 'literal')
		.map(x => x.type) as [DatePart, DatePart, DatePart]

	private readonly splitterRegex = new RegExp('^' + this.order.map((part, index, parts) => {
		const yearComesBeforeDay = this.order.indexOf('year') < this.order.indexOf('day')
		const { minLength, maxLength, optional } = infoByPart.get(part)!
		if (yearComesBeforeDay) {
			const separator = index === parts.length - 1 ? '' : '\\' + this.separator
			return `(:?(?<${part}>\\d{${minLength},${maxLength}})${separator})${optional ? '?' : ''}`
		} else {
			const separator = index === 0 ? '' : '\\' + this.separator
			return `(${separator}:?(?<${part}>\\d{${minLength},${maxLength}}))${optional ? '?' : ''}`
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

		referenceDate ??= DateTime.from(undefined, this.calendar, this.timeZone)

		const year = getValueOf('year') ?? referenceDate.year

		const month = getValueOf('month') ?? 0

		if (month <= 0 || month > referenceDate.yearEnd.month) {
			return undefined
		}

		const day = getValueOf('day') ?? 0
		if (day <= 0 || day > referenceDate.monthEnd.day) {
			return undefined
		}

		return referenceDate.with({ day, month, year })
	}
}