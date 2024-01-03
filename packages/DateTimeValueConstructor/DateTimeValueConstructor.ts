import { apiValueConstructor, type ApiValueConstructor } from '@a11d/api'
import '@3mo/date-time'

@apiValueConstructor()
export class DateValueConstructor implements ApiValueConstructor<DateTime, string> {
	private static readonly regex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

	shallConstruct = (value: unknown) => typeof value === 'string' && DateValueConstructor.regex.test(value)
	construct = (text: string) => DateTime.parse(text)!

	shallDeconstruct = (value: unknown) => value instanceof Date
	deconstruct = (value: DateTime) => value.toISOString()
}