import { DateTimeParser } from './DateTimeParser.js'

type MonthOrDay = 'month' | 'day'

export class DateTimeDayMonthShortcutParser extends DateTimeParser {
	private static readonly whiteSpaceRegex = /\s/g

	private readonly calendar = DateTime.getCalendar(this.language)
	private readonly timeZone = DateTime.getTimeZone(this.language)
	private readonly order = DateTime.from(undefined, this.calendar, this.timeZone)
		.formatToParts({ language: this.language, day: 'numeric', month: 'numeric' })
		.filter(x => x.type !== 'literal')
		.map(x => x.type) as [MonthOrDay, MonthOrDay]

	parse(text: string, referenceDate?: DateTime) {
		text = text.replace(DateTimeDayMonthShortcutParser.whiteSpaceRegex, '')

		const number = Number(text)
		if (!text || text.length > 4 || isNaN(number)) {
			return undefined
		}

		referenceDate ??= DateTime.from(undefined, this.calendar, this.timeZone)

		const tryGetValue = (part1: number, part2: number) => {
			let month: number
			let day: number
			(this.order[0] === 'month')
				? [month, day] = [part1, part2]
				: [day, month] = [part1, part2]
			return (month > 0 && month <= referenceDate!.yearEnd.month && day > 0 && day <= referenceDate!.monthEnd.day)
				? referenceDate?.with({ month, day })
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

		return undefined
	}
}