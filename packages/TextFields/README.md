# Text Fields

Web components for text, email, search, password and multi-line fields, the password one with a reveal toggle.

[![npm](https://img.shields.io/npm/v/@3mo/text-fields?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/text-fields) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-text-fields-text-field--overview)

`mo-field-text` — A single-line text field.

`mo-field-email` — A text field for an email address, which offers the email keyboard on touch devices.

`mo-field-password` — A text field for a password, with a button that reveals it.

`mo-field-search` — A text field for a search term, with a search icon and a button that clears it.

`mo-field-text-area` — A multi-line text field.

## Installation

```sh
npm install @3mo/text-fields
```

```ts
import '@3mo/text-fields'
```

## Usage

```html
<mo-field-text label='Name' value='Clarke Griffin'></mo-field-text>
```

## Examples

- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-field--states) — Required, read-only, disabled and dense.
- [Length](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-field--length) — `maxLength` counts down the characters left, and a value shorter than `minLength` is invalid.
- [Pattern](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-field--pattern) — `pattern` validates the value against a regular expression, as on a native input - type a letter.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-field--slots) — `start` and `end` hold text, icons or buttons beside the value.
- [Text Align](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-field--text-align) — The value follows the field's `text-align`.
- [Content Sizing](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-field--content-sizing) — With `width: fit-content` the field grows with its value - type a long one.

### Email Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-email-field--default)
- [Default Label](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-email-field--default-label) — Without a `label` the field is labelled "Email", in the page's language.
- [Invalid](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-email-field--invalid) — A value the browser does not accept as an address makes the field invalid.

### Password Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-password-field--default)
- [Reveal](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-password-field--reveal) — `reveal` shows the password in plain text; the eye button at the end toggles it.
- [New Password](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-password-field--new-password) — `autoComplete` is `current-password` by default; `new-password` lets the browser suggest a strong one.

### Search Field

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-search-field--default)
- [Dense](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-search-field--dense) — Without a `label` the field is labelled "Search", and a dense one suits a toolbar.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-search-field--slots) — The `end` slot holds further actions, after the clear button.

### Text Area

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-area--default)
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-area--slots) — `start` and `end` hold buttons beside the text.
- [Length](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-text-fields-text-area--length) — `maxLength` counts down the characters left.

## API

### `mo-field-text`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `minLength` | `minLength` | `number \| undefined` |  | The fewest characters a valid value has |
| `maxLength` | `maxLength` | `number \| undefined` |  | The most characters the field takes, counted down at the end |
| `pattern` | `pattern` | `string \| undefined` |  | A regular expression the value has to match, as on a native input |
| `autoComplete` | `autoComplete` | `FieldTextAutoComplete \| undefined` |  | What the browser may fill in, as the native `autocomplete` attribute |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `string \| undefined` |  | The text |
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

### `mo-field-email`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `string \| undefined` |  | The value of the field. |
| `label` | `label` | `string` | `"t('Email')"` | The field's label |
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

### `mo-field-password`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `reveal` | `reveal` | `boolean` | `false` | Shows the password in plain text |
| `minLength` | `minLength` | `number \| undefined` |  | The fewest characters a valid value has |
| `maxLength` | `maxLength` | `number \| undefined` |  | The most characters the field takes, counted down at the end |
| `pattern` | `pattern` | `string \| undefined` |  | A regular expression the value has to match, as on a native input |
| `autoComplete` | `autoComplete` | `FieldTextAutoComplete` | `"current-password"` | `current-password` by default; `new-password` lets the browser suggest one |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `string \| undefined` |  | The text |
| `label` | `label` | `string` | `"t('Password')"` | The field's label |
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

### `mo-field-search`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `minLength` | `minLength` | `number \| undefined` |  | The fewest characters a valid value has |
| `maxLength` | `maxLength` | `number \| undefined` |  | The most characters the field takes, counted down at the end |
| `pattern` | `pattern` | `string \| undefined` |  | A regular expression the value has to match, as on a native input |
| `autoComplete` | `autoComplete` | `FieldTextAutoComplete \| undefined` |  | What the browser may fill in, as the native `autocomplete` attribute |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `string \| undefined` |  | The text |
| `label` | `label` | `string` | `"t('Search')"` | The field's label |
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

### `mo-field-text-area`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `minLength` | `minLength` | `number \| undefined` |  | The fewest characters a valid value has |
| `maxLength` | `maxLength` | `number \| undefined` |  | The most characters the field takes, counted down at the end |
| `pattern` | `pattern` | `string \| undefined` |  | A regular expression the value has to match, as on a native input |
| `autoComplete` | `autoComplete` | `FieldTextAutoComplete \| undefined` |  | What the browser may fill in, as the native `autocomplete` attribute |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `string \| undefined` |  | The text |
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

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-text-fields-text-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-text-fields-text-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/TextFields)

## License

MIT © 3MO GmbH
