import { DateTimeParser } from './DateTimeParser.js'

type DatePart = 'year' | 'month' | 'day'

export class DateTimeShortcutParser extends DateTimeParser {
	private static readonly whiteSpaceRegex = /\s/g

	private readonly calendar = DateTime.getCalendar(this.language)
	private readonly timeZone = DateTime.getTimeZone(this.language)
	private readonly twoPartOrder = this.getOrder('day', 'month') as [DatePart, DatePart]
	private readonly threePartOrder = this.getOrder('day', 'month', 'year') as [DatePart, DatePart, DatePart]

	private getOrder(...parts: Array<DatePart>) {
		return new DateTime({ calendar: this.calendar, timeZone: this.timeZone })
			.formatToParts(this.language, parts.map(x => ({ [x]: 'numeric' })).reduce((a, b) => ({ ...a, ...b }), {}))
			.filter(x => x.type !== 'literal')
			.map(x => x.type)
	}

	parse(text: string, referenceDate?: DateTime) {
		text = text.replace(DateTimeShortcutParser.whiteSpaceRegex, '')

		const number = Number(text)
		if (!text || text.length > 8 || isNaN(number)) {
			return undefined
		}

		referenceDate ??= new DateTime({ calendar: this.calendar, timeZone: this.timeZone })

		const tryGetValue = (...parts: [number, number, number?]) => {
			const ref = referenceDate!
			const getValue = (part: DatePart) => parts[parts.length === 2 ? this.twoPartOrder.indexOf(part) : this.threePartOrder.indexOf(part)] ?? ref[part]
			const day = getValue('day')
			const month = getValue('month')
			let year = getValue('year')
			if (year < 100) {
				year += Math.floor(ref.year / 100) * 100
			}
			return (month > 0 && month <= ref.yearEnd.month && day > 0 && day <= ref.monthEnd.day)
				? referenceDate?.with({ year, month, day })
				: undefined
		}

		if (text.length <= 2) {
			if (number <= referenceDate.monthEnd.day) {
				return referenceDate.with({ day: number })
			}

			const value = tryGetValue(Number(text.substring(0, 1)), Number(text.substring(1, 2)))
			if (value) {
				return value
			}
		}

		if (text.length === 3) {
			let value = tryGetValue(Number(text.substring(0, 2)), Number(text.substring(2, 3)))
			if (value) {
				return value
			}
			value = tryGetValue(Number(text.substring(0, 1)), Number(text.substring(1, 3)))
			if (value) {
				return value
			}
		}

		if (text.length === 4) {
			const value = tryGetValue(Number(text.substring(0, 2)), Number(text.substring(2, 4)))
			if (value) {
				return value
			}
		}

		if (text.length === 6) {
			const value = tryGetValue(Number(text.substring(0, 2)), Number(text.substring(2, 4)), Number(text.substring(4, text.length)))
			if (value) {
				return value
			}
		}

		if (text.length === 8) {
			const value = this.threePartOrder.indexOf('year') < this.threePartOrder.indexOf('day')
				? tryGetValue(Number(text.substring(0, 4)), Number(text.substring(4, 6)), Number(text.substring(6, 8)))
				: tryGetValue(Number(text.substring(0, 2)), Number(text.substring(2, 4)), Number(text.substring(4, text.length)))
			if (value) {
				return value
			}
		}

		return undefined
	}
}