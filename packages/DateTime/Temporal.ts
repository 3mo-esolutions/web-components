import * as Polyfill from 'temporal-polyfill'

globalThis.Temporal ??= Polyfill.Temporal

declare global {
	var Temporal: typeof import('temporal-polyfill').Temporal
	namespace Temporal {
		type Instant = Polyfill.Temporal.Instant
		type ZonedDateTime = Polyfill.Temporal.ZonedDateTime
		type PlainDate = Polyfill.Temporal.PlainDate
		type PlainTime = Polyfill.Temporal.PlainTime
		type PlainDateTime = Polyfill.Temporal.PlainDateTime
		type Duration = Polyfill.Temporal.Duration
	}
}