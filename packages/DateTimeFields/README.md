# Date Time Fields

Web components for date, date-time, time and range fields with locale-aware segmented entry and a calendar picker.

[![npm](https://img.shields.io/npm/v/@3mo/date-time-fields?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/date-time-fields) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-date-time-fields-date-field--overview)

`mo-field-date` — A date field, typed into segments in the language's order or picked from a calendar, at the precision of a day, a week, a month or a year.

`mo-field-date-range` — A date range field, with segments for each end and a calendar that picks the start and then the end.

`mo-field-date-time` — A date and time field, typed into segments in the language's order or picked from a calendar and time lists.

Its behaviour is `FieldDateTimeController`, for a date field of another design.

`mo-field-date-time-range` — A date and time range field, with segments for each end and a picker that edits one end at a time.

Its behaviour is `FieldDateTimeRangeController`, for a date range field of another design.

`mo-field-time` — A time-of-day field whose value is the `HH:mm` string of a native time input, while its segments follow the language's clock.

Its behaviour is `FieldTimeController`, for a time field of another design.

## Installation

```sh
npm install @3mo/date-time-fields
```

```ts
import '@3mo/date-time-fields'
```

## Usage

```html
<mo-field-date label='Due date' precision='day'></mo-field-date>
```

## Examples

- [Keyboard](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-field--keyboard) — Digits fill the segments, which move on when full; ArrowUp and ArrowDown step a unit and Alt+ArrowDown opens the calendar.
- [Shortcut Reference Date](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-field--shortcut-reference-date) — Shortcuts count from `shortcutReferenceDate` instead of today: `+1` here is 16 January 2030.
- [Precisions](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-field--precisions) — `precision` picks a year, a month, a week or a day.
- [Min And Max](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-field--min-and-max) — Days outside `min` and `max` are disabled in the calendar, presets outside them are left out, and a typed one makes the field invalid.
- [Date Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-field--date-disabled) — `dateDisabled` refuses the dates it returns `true` for, here weekends.
- [Picker Hidden](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-field--picker-hidden) — `pickerHidden` removes the calendar, leaving the segments to type into.
- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-field--states) — A required field turns invalid once left empty; a disabled one ignores input, a readonly one only shows its value, and a dense one is shorter.

### Date Range Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-range-field--default)
- [Keyboard](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-range-field--keyboard) — Each end has its own segments, and the arrow keys cross between them.
- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-range-field--value) — `value` is a `DateTimeRange`, and either end may be left open.
- [Precisions](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-range-field--precisions) — At `month` or `year` precision each end is a whole month or year, and the presets offer only ranges of those.
- [Date Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-range-field--date-disabled) — `dateDisabled` refuses the dates it returns `true` for, here weekends, at either end.
- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-range-field--states) — A required field turns invalid once left empty; a disabled one ignores input and a readonly one only shows its value.

### Date Time Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-field--default)
- [Precisions](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-field--precisions) — Beyond the day, `precision` adds the hour, the minute or the second; the picker shows a list per unit beside the calendar.
- [Hour Cycle](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-field--hour-cycle) — The time follows the language's clock unless `hourCycle` sets one: `h12` with AM and PM, or `h23`.
- [Date Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-field--date-disabled) — `dateDisabled` refuses the dates it returns `true` for, here weekends.
- [Custom Date Time Field](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-field--custom-date-time-field) — `FieldDateTimeController` carries everything the field does - the segments, the picker, the presets, `min`, `max` and the validity - so a date field of another design only renders it.

### Date Time Range Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-range-field--default)
- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-range-field--value) — The picker edits one end at a time, chosen by its tabs or by entering that end's segments.
- [Date Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-range-field--date-disabled) — `dateDisabled` refuses the dates it returns `true` for, here weekends, at either end.
- [Custom Range Field](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-date-time-range-field--custom-range-field) — `FieldDateTimeRangeController` carries everything the field does - a group of segments per end, the end the picker edits, range shortcuts, the presets and the validity - so a range field of another design only renders it.

### Time Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-time-field--default)
- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-time-field--value) — `value` is the 24-hour `HH:mm` string of a native time input, while the segments follow the language's clock - switch the language to see it.
- [Seconds](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-time-field--seconds) — `precision='second'` adds the seconds, and the value becomes `HH:mm:ss`.
- [Hour Cycle](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-time-field--hour-cycle) — `hourCycle` sets the clock regardless of the language: `h12` with AM and PM, or `h23`.
- [Picker Hidden](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-time-field--picker-hidden) — `pickerHidden` removes the hour and minute lists, leaving the segments to type into.
- [Custom Time Field](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-date-time-fields-time-field--custom-time-field) — `FieldTimeController` carries everything the field does - the segments, the `HH:mm` value, the picker key and the validity - so a time field of another design only renders it.

## Accessibility

The segments follow the [segmented input](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-segmented-input--overview): a `group` named after the `label`, with one `spinbutton` per part, and one tab stop for the group. `aria-invalid`, `aria-required` and `aria-readonly` follow the field.
`Alt` `ArrowDown` opens the picker. The picker's calendar cannot be operated with the keyboard yet, so the segments are the keyboard's way in.

## API

### `mo-field-date`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `controller` |  | `FieldDateTimeController<this>` |  | The field's behaviour, for a date field of another design. |
| `open` | `open` | `boolean` | `false` | Whether the date picker is open |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hide the date picker |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `shortcutReferenceDate` | `shortcutReferenceDate` | `DateTime` | `"new DateTime()"` | The date to use as a reference for shortcuts and for the units the user leaves out |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Day"` | The precision of the date picker. Defaults to 'minute' |
| `hourCycle` | `hourCycle` | `HourCycle \| undefined` |  | The hour cycle of the time segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention. |
| `min` | `min` | `DateTime \| undefined` |  | The minimum selectable date (inclusive). Dates before this are disabled. |
| `max` | `max` | `DateTime \| undefined` |  | The maximum selectable date (inclusive). Dates after this are disabled. |
| `dateDisabled` | `dateDisabled` | `((date: DateTime) => boolean) \| undefined` |  | A function that determines whether a date should be disabled. Receives a DateTime object and should return a boolean. |
| `value` | `value` | `Date \| undefined` |  | The field's value |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `segments` | The group of segments making up one date-time value |
| `segment` | An editable unit of the value |
| `literal` | A separator between the units |
| `container` | Field's container |

### `mo-field-date-range`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `controller` |  | `FieldDateTimeRangeController<this>` |  | The field's behaviour, for a date field of another design. |
| `open` | `open` | `boolean` | `false` | Whether the date picker is open |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hide the date picker |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `shortcutReferenceDate` | `shortcutReferenceDate` | `DateTime` | `"new DateTime()"` | The date to use as a reference for shortcuts and for the units the user leaves out |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Day"` | The precision of the date picker. Defaults to 'minute' |
| `hourCycle` | `hourCycle` | `HourCycle \| undefined` |  | The hour cycle of the time segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention. |
| `min` | `min` | `DateTime \| undefined` |  | The minimum selectable date (inclusive). Dates before this are disabled. |
| `max` | `max` | `DateTime \| undefined` |  | The maximum selectable date (inclusive). Dates after this are disabled. |
| `dateDisabled` | `dateDisabled` | `((date: DateTime) => boolean) \| undefined` |  | A function that determines whether a date should be disabled. Receives a DateTime object and should return a boolean. |
| `value` | `value` | `DateTimeRange \| undefined` |  | The selected date range. |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `segments-range` | Both ends' segments and the delimiter between them |
| `segments` | The group of segments making up one date-time value |
| `segment` | An editable unit of the value |
| `literal` | A separator between the units |
| `container` | Field's container |

### `mo-field-date-time`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `controller` |  | `FieldDateTimeController<this>` |  | The field's behaviour, for a date field of another design. |
| `open` | `open` | `boolean` | `false` | Whether the date picker is open |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hide the date picker |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `shortcutReferenceDate` | `shortcutReferenceDate` | `DateTime` | `"new DateTime()"` | The date to use as a reference for shortcuts and for the units the user leaves out |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Minute"` | The precision of the date picker. Defaults to 'minute' |
| `hourCycle` | `hourCycle` | `HourCycle \| undefined` |  | The hour cycle of the time segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention. |
| `min` | `min` | `DateTime \| undefined` |  | The minimum selectable date (inclusive). Dates before this are disabled. |
| `max` | `max` | `DateTime \| undefined` |  | The maximum selectable date (inclusive). Dates after this are disabled. |
| `dateDisabled` | `dateDisabled` | `((date: DateTime) => boolean) \| undefined` |  | A function that determines whether a date should be disabled. Receives a DateTime object and should return a boolean. |
| `value` | `value` | `Date \| undefined` |  | The field's value |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `segments` | The group of segments making up one date-time value |
| `segment` | An editable unit of the value |
| `literal` | A separator between the units |
| `container` | Field's container |

### `mo-field-date-time-range`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `controller` |  | `FieldDateTimeRangeController<this>` |  | The field's behaviour, for a date field of another design. |
| `open` | `open` | `boolean` | `false` | Whether the date picker is open |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hide the date picker |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `shortcutReferenceDate` | `shortcutReferenceDate` | `DateTime` | `"new DateTime()"` | The date to use as a reference for shortcuts and for the units the user leaves out |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Minute"` | The precision of the date picker. Defaults to 'minute' |
| `hourCycle` | `hourCycle` | `HourCycle \| undefined` |  | The hour cycle of the time segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention. |
| `min` | `min` | `DateTime \| undefined` |  | The minimum selectable date (inclusive). Dates before this are disabled. |
| `max` | `max` | `DateTime \| undefined` |  | The maximum selectable date (inclusive). Dates after this are disabled. |
| `dateDisabled` | `dateDisabled` | `((date: DateTime) => boolean) \| undefined` |  | A function that determines whether a date should be disabled. Receives a DateTime object and should return a boolean. |
| `value` | `value` | `DateTimeRange \| undefined` |  | The selected date range. |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `segments-range` | Both ends' segments and the delimiter between them |
| `segments` | The group of segments making up one date-time value |
| `segment` | An editable unit of the value |
| `literal` | A separator between the units |
| `container` | Field's container |

### `mo-field-time`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the time picker is open |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hide the time picker |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Minute"` | 'minute' (default) or 'second' |
| `hourCycle` | `hourCycle` | `HourCycle \| undefined` |  | The hour cycle of the segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention. |
| `shortcutReferenceDate` | `shortcutReferenceDate` | `DateTime` | `"new DateTime()"` | The date the units the user leaves out are taken from. Defaults to now. |
| `value` | `value` | `string \| undefined` |  | The time as `HH:mm` or `HH:mm:ss` |
| `label` | `label` | `string` | `"t('Time')"` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `segments` | The group of segments making up the time |
| `segment` | An editable unit of the time |
| `literal` | A separator between the units |
| `container` | Field's container |

### `mo-field-toggleable-date-time-range`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `controller` |  | `FieldDateTimeRangeController<this>` |  | The field's behaviour, for a date field of another design. |
| `open` | `open` | `boolean` | `false` | Whether the date picker is open |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hide the date picker |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `shortcutReferenceDate` | `shortcutReferenceDate` | `DateTime` | `"new DateTime()"` | The date to use as a reference for shortcuts and for the units the user leaves out |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Day"` | The precision of the date picker. Defaults to 'minute' |
| `hourCycle` | `hourCycle` | `HourCycle \| undefined` |  | The hour cycle of the time segments ('h11', 'h12', 'h23' or 'h24'). Defaults to the language's convention. |
| `min` | `min` | `DateTime \| undefined` |  | The minimum selectable date (inclusive). Dates before this are disabled. |
| `max` | `max` | `DateTime \| undefined` |  | The maximum selectable date (inclusive). Dates after this are disabled. |
| `dateDisabled` | `dateDisabled` | `((date: DateTime) => boolean) \| undefined` |  | A function that determines whether a date should be disabled. Receives a DateTime object and should return a boolean. |
| `value` | `value` | `DateTimeRange \| undefined` |  | The selected date range. |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `segments-range` | Both ends' segments and the delimiter between them |
| `segments` | The group of segments making up one date-time value |
| `segment` | An editable unit of the value |
| `literal` | A separator between the units |
| `container` | Field's container |

### `mo-calendar`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `value` | `value` | `DateTimeRange \| undefined` |  |
| `precision` | `precision` | `FieldDateTimePrecision` |  |
| `includeWeek` | `includeWeek` | `boolean` | `false` |
| `min` | `min` | `DateTime \| undefined` |  |
| `max` | `max` | `DateTime \| undefined` |  |
| `dateDisabled` | `dateDisabled` | `((date: DateTime) => boolean) \| undefined` |  |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `dateClick` | `DateTime` | Dispatched when a date is clicked, with the clicked date as detail. |

### `mo-hour-list`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `hourCycle` | `hourCycle` | `"h11" \| "h12" \| "h23" \| "h24" \| undefined` |  | Defaults to the language's convention, so English lists "02 PM" where German lists "14". |
| `navigationDate` | `navigationDate` | `DateTime` |  |  |
| `value` | `value` | `DateTime \| undefined` |  |  |

#### Events

| Name | Detail |
| --- | --- |
| `navigate` | `DateTime` |

### `mo-minute-list`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `navigationDate` | `navigationDate` | `DateTime` |  |
| `value` | `value` | `DateTime \| undefined` |  |

#### Events

| Name | Detail |
| --- | --- |
| `navigate` | `DateTime` |

### `mo-second-list`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `navigationDate` | `navigationDate` | `DateTime` |  |
| `value` | `value` | `DateTime \| undefined` |  |

#### Events

| Name | Detail |
| --- | --- |
| `navigate` | `DateTime` |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-date-time-fields-date-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-date-time-fields-date-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/DateTimeFields)

## License

MIT © 3MO GmbH