import { DateTime } from '../DateTime.js'
import { DateTimeParser } from './DateTimeParser.js'

export class DateTimeNativeParser extends DateTimeParser {
	override parse(text: string, referenceDate?: DateTime) {
		const millisecondsFromEpoch = Date.parse(text)
		if (isNaN(millisecondsFromEpoch)) {
			return undefined
		}
		return new DateTime(millisecondsFromEpoch, { calendar: referenceDate?.calendar, timeZone: referenceDate?.timeZone })
	}
}