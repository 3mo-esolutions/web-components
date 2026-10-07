# Date Time

Utilities for dates and times on Temporal: global DateTime, DateTimeRange and TimeSpan classes that parse localized input.

[![npm](https://img.shields.io/npm/v/@3mo/date-time?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/date-time) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-date-time--overview)

## Installation

```sh
npm install @3mo/date-time
```

```ts
import { DateTime, DateTimeRange, TimeSpan } from '@3mo/date-time'
```

## Usage

```html
<span>${now.format({ dateStyle: 'full', timeStyle: 'short' })}</span>
<span>${now.formatAsDate()}</span>
<span>${now.format({ week: 'medium' })}</span>
```

## Examples

- [Arithmetic](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-date-time--arithmetic) — Every operation returns a new `DateTime`: `add`, `subtract` and `with` take Temporal durations and fields, the `…Start`, `…End` and `…Range` getters snap to a day, week, month or year, and `since` measures a `TimeSpan`.
- [Parsing](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-date-time--parsing) — `toDateTime()` reads what people type, in the language's own order: a full date, a day of this month (`15`), day and month (`1503`), an offset (`+3`, `-2 weeks`) or `0` for today.
- [Ranges](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-date-time--ranges) — A `DateTimeRange` has two ends, either of which may be open, and formats them the way the language writes ranges.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `DateTimeParser` | class |  |
| `DateTimeZeroParser` | class |  |
| `DateTimeOperationParser` | class |  |
| `DateTimeLocalParser` | class |  |
| `DateTimeShortcutParser` | class |  |
| `DateTimeNativeParser` | class |  |
| `DateTimeRangeParser` | class |  |
| `DateTimeRangeDelimiterParser` | class |  |
| `DateTime` | class | A `Date` with Temporal's fields and arithmetic in the language's calendar and time zone, which also parses localized input. |
| `DateTimeRange` | class | A range between two `DateTime`s, either of which may be open, formatted and parsed the way the language writes ranges. |
| `TimeSpan` | class | A duration in milliseconds, formatted as relative time such as "in 3 days". |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-date-time--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-date-time--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/DateTime)

## License

MIT © 3MO GmbH
