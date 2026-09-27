# Number Fields

Web components for number, percent and currency fields that format and parse values in the user's locale.

[![npm](https://img.shields.io/npm/v/@3mo/number-fields?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/number-fields) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-number-fields-number-field--overview)

`mo-field-number` — A field for a number, formatted in the user's language and clamped to `min` and `max` when committed.

`mo-field-currency` — A number field for an amount of money, showing the currency's symbol at the end.

`mo-field-percent` — A number field for a percentage, from 0 to 100 unless `min` and `max` say otherwise, with a percent sign at the end.

## Installation

```sh
npm install @3mo/number-fields
```

```ts
import '@3mo/number-fields'
```

## Usage

```html
<mo-field-number label='Quantity' value='1'></mo-field-number>
```

## Examples

- [Range](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-number-field--range) — A value outside `min` and `max` is clamped when it is committed - type 80 and leave the field.
- [Formatting](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-number-field--formatting) — The value is formatted in the page's language - switch it in the toolbar to see the separators change.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-number-field--slots) — `start` and `end` hold icons or units beside the number.
- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-number-field--states) — Required, read-only, disabled and dense.

### Currency Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-currency-field--default)
- [Currencies](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-currency-field--currencies) — `currency` takes an ISO 4217 code and shows its symbol; without one no symbol is shown.

### Percent Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-percent-field--default)
- [Range](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-percent-field--range) — The value is clamped to 0-100 when committed - type 150 and leave the field.
- [Percent Sign](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-number-fields-percent-field--percent-sign) — `percentSign` replaces the sign shown at the end.

## API

### `mo-field-number`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `min` | `min` | `number \| undefined` |  | The minimum value of the field. |
| `max` | `max` | `number \| undefined` |  | The maximum value of the field. |
| `step` | `step` | `number \| undefined` |  | The step value of the field. |
| `selectOnFocus` | `selectOnFocus` | `true` | `true` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `number \| undefined` |  | The value of the field. |
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
| `input` | The input element. |
| `container` | Field's container |

### `mo-field-currency`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `currency` | `currency` | `Currency \| undefined` | `"defaultCurrency"` | The currency of the field. |
| `min` | `min` | `number \| undefined` |  | The minimum value of the field. |
| `max` | `max` | `number \| undefined` |  | The maximum value of the field. |
| `step` | `step` | `number \| undefined` |  | The step value of the field. |
| `selectOnFocus` | `selectOnFocus` | `true` | `true` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `number \| undefined` |  | The value of the field. |
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
| `input` | The input element. |
| `container` | Field's container |

### `mo-field-percent`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `percentSign` | `percentSign` | `string` | `"%"` | The percent sign of the field. |
| `min` | `min` | `number` | `0` | The minimum value of the field. |
| `max` | `max` | `number` | `100` | The maximum value of the field. |
| `step` | `step` | `number \| undefined` |  | The step value of the field. |
| `selectOnFocus` | `selectOnFocus` | `true` | `true` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `number \| undefined` |  | The value of the field. |
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
| `input` | The input element. |
| `container` | Field's container |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-number-fields-number-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-number-fields-number-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/NumberFields)

## License

MIT © 3MO GmbH