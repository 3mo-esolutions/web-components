import { DateTime } from '../DateTime.js'
import { DateTimeParser } from './DateTimeParser.js'

export class DateTimeNativeParser extends DateTimeParser {
	override parse(text: string, referenceDate?: DateTime) {
		const millisecondsFromEpoch = Date.parse(text)
		if (isNaN(millisecondsFromEpoch)) {
			return undefined
		}
		return DateTime.from(millisecondsFromEpoch, referenceDate?.calendar, referenceDate?.timeZone)
	}
}