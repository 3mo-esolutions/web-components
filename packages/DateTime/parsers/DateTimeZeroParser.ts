import { DateTimeParser } from './DateTimeParser.js'

export class DateTimeZeroParser extends DateTimeParser {
	private static readonly whiteSpaceRegex = /\s/g

	parse(text: string, referenceDate = new DateTime) {
		text = text.replace(DateTimeZeroParser.whiteSpaceRegex, '')

		if (Number(text) === 0) {
			return referenceDate
		}

		return undefined
	}
}