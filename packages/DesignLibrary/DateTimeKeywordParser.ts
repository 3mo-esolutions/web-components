import { DateTime, DateTimeParser } from '@3mo/date-time'

export class DateTimeKeywordParser extends DateTimeParser {
	override parse(text: string, referenceDate = new DateTime) {
		text = text.trim().toLowerCase()
		switch (text) {
			case 'h': return new DateTime(referenceDate)
			case 'üm': return referenceDate.add({ days: +2 })
			case 'm': return referenceDate.add({ days: +1 })
			case 'üüm': return referenceDate.add({ days: +3 })
			case 'g': return referenceDate.add({ days: -1 })
			case 'vg': return referenceDate.add({ days: -2 })
			case 'vvg': return referenceDate.add({ days: -3 })
			case 'adw': return referenceDate.weekStart
			case 'edw': return referenceDate.weekEnd
			case 'anw': return referenceDate.add({ weeks: +1 }).weekStart
			case 'enw': return referenceDate.add({ weeks: +1 }).weekEnd
			case 'alw': return referenceDate.add({ weeks: -1 }).weekStart
			case 'elw': return referenceDate.add({ weeks: -1 }).weekEnd
			case 'flw': return referenceDate.add({ weeks: -1 }).weekEnd.add({ days: -2 })
			case 'fdw': return referenceDate.weekEnd.add({ days: -2 })
			case 'fnw': return referenceDate.add({ weeks: +1 }).weekEnd.add({ days: -2 })
			case 'adm': return referenceDate.monthStart
			case 'edm': return referenceDate.monthEnd
			case 'anm': return referenceDate.add({ months: +1 }).monthStart
			case 'enm': return referenceDate.add({ months: +1 }).monthEnd
			case 'alm': return referenceDate.add({ months: -1 }).monthStart
			case 'elm': return referenceDate.add({ months: -1 }).monthEnd
			case 'adj': return referenceDate.yearStart
			case 'edj': return referenceDate.yearEnd
			case 'anj': return referenceDate.add({ years: +1 }).yearStart
			case 'enj': return referenceDate.add({ years: +1 }).yearEnd
			case 'alj': return referenceDate.add({ years: -1 }).yearStart
			case 'elj': return referenceDate.add({ years: -1 }).yearEnd
			default: return undefined
		}
	}
}

DateTime.addParser(DateTimeKeywordParser)