import { DateTime } from '../DateTime.js'
import { DateTimeNativeParser } from './DateTimeNativeParser.js'
import '../index.js'

describe('DateTimeNativeParser', () => {
	const parser = new DateTimeNativeParser('en')

	it('should parse ISO 8601 strings via the native Date parser', () => {
		expect(parser.parse('2020-06-10T12:34:56.000Z')?.valueOf()).toBe(Date.parse('2020-06-10T12:34:56.000Z'))
		expect(parser.parse('2020-06-10')?.valueOf()).toBe(Date.parse('2020-06-10'))
		expect(parser.parse('2020-06-10T12:34:56+02:00')?.valueOf()).toBe(Date.parse('2020-06-10T10:34:56.000Z'))
	})

	it('should return undefined for unparseable text', () => {
		expect(parser.parse('')).toBeUndefined()
		expect(parser.parse('   ')).toBeUndefined()
		expect(parser.parse('not a date')).toBeUndefined()
		expect(parser.parse('~~~')).toBeUndefined()
	})

	it('should carry the reference date\'s calendar and time zone onto the result', () => {
		const referenceDate = DateTime.from(Date.parse('2025-01-01T00:00:00.000Z'), 'persian', 'Asia/Tehran')

		const parsed = parser.parse('2025-05-19T00:00:00.000Z', referenceDate)

		expect(parsed?.valueOf()).toBe(Date.parse('2025-05-19T00:00:00.000Z'))
		expect(parsed?.calendarId).toBe('persian')
		expect(parsed?.timeZoneId).toBe('Asia/Tehran')
		expect(parsed?.year).toBe(1404)
	})
})