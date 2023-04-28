import { Localizer } from '@3mo/localization'

export class DateParser {
	private static getDateSeparator(language = Localizer.currentLanguage) {
		return Intl.DateTimeFormat(language).format(new Date).replace(/\p{Number}/gu, '')[0]
	}

	static parse(dateText: string, referenceDate = new DateTime) {
		dateText = dateText.toLowerCase().trim()

		if (!dateText) {
			return undefined
		}

		if (dateText.startsWith('+') || dateText.startsWith('-')) {
			return DateParser.parseDateFromOperation(dateText, referenceDate)
		}

		if (dateText.includes(DateParser.getDateSeparator()!)) {
			return DateParser.parseDateFromLocalDate(dateText, referenceDate)
		}

		if ((dateText.length === 3 || dateText.length === 4 || dateText.length === 8) && !isNaN(parseInt(dateText))) {
			return DateParser.parseDateFromShortcut(dateText)
		}

		const date = new DateTime(dateText || new DateTime)
		if (String(date) !== 'Invalid Date') {
			return date
		}

		const keywordDate = DateParser.parseDateFromKeyword(dateText, referenceDate)
		if (keywordDate) {
			return keywordDate
		}

		return undefined
	}

	private static parseDateFromLocalDate(dateText: string, referenceDate = new DateTime) {
		const date = new DateTime(dateText)

		if (String(date) === 'Invalid Date') {
			return undefined
		}

		const dateParts = dateText.split(DateParser.getDateSeparator()!)

		if (dateParts.length === 2) {
			date.setFullYear(referenceDate.getFullYear())
		}

		return date
	}

	private static parseDateFromOperation(dateText: string, referenceDate = new DateTime) {
		const lastChar = dateText.charAt(dateText.length - 1).toLowerCase()
		let num: number

		if (!isNaN(Number(lastChar))) {
			num = parseInt(dateText.substring(0, dateText.length))
			return referenceDate.addDays(num)
		} else {
			num = parseInt(dateText.substring(0, dateText.length - 1))
			switch (lastChar) {
				case 'y': return referenceDate.addYears(num)
				case 'm': return referenceDate.addMonths(num)
				default: return undefined
			}
		}
	}

	private static parseDateFromShortcut(dateText: string) {
		const day = dateText.substring(0, 2)
		const month = dateText.substring(2, dateText.length >= 4 ? 4 : 3)
		const year = length !== 8 ? undefined : dateText.substring(4, 8)
		return new DateTime(year ? parseInt(year) : new Date().getFullYear(), parseInt(month) - 1, parseInt(day))
	}

	private static parseDateFromKeyword(keyword: string, referenceDate = new DateTime) {
		switch (keyword) {
			case 'h': return new DateTime(referenceDate)
			case 'üm': return referenceDate.addDays(+2)
			case 'm': return referenceDate.addDays(+1)
			case 'üüm': return referenceDate.addDays(+3)
			case 'g': return referenceDate.addDays(-1)
			case 'vg': return referenceDate.addDays(-2)
			case 'vvg': return referenceDate.addDays(-3)
			case 'adw': return referenceDate.weekStart
			case 'edw': return referenceDate.weekEnd
			case 'anw': return referenceDate.addWeeks(+1).weekStart
			case 'enw': return referenceDate.addWeeks(+1).weekEnd
			case 'alw': return referenceDate.addWeeks(-1).weekStart
			case 'elw': return referenceDate.addWeeks(-1).weekEnd
			case 'adm': return referenceDate.monthStart
			case 'edm': return referenceDate.monthEnd
			case 'anm': return referenceDate.addMonths(+1).monthStart
			case 'enm': return referenceDate.addMonths(+1).monthEnd
			case 'alm': return referenceDate.addMonths(-1).monthStart
			case 'elm': return referenceDate.addMonths(-1).monthEnd
			case 'adj': return referenceDate.yearStart
			case 'edj': return referenceDate.yearEnd
			case 'anj': return referenceDate.addYears(+1).yearStart
			case 'enj': return referenceDate.addYears(+1).yearEnd
			case 'alj': return referenceDate.addYears(-1).yearStart
			case 'elj': return referenceDate.addYears(-1).yearEnd
			default: return undefined
		}
	}
}