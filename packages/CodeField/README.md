# Code Field

A web component for verification codes, one-time passwords and PINs, entered one cell per character with autofill.

[![npm](https://img.shields.io/npm/v/@3mo/code-field?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/code-field) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-code-field--overview)

A field for a short code entered one character per cell — a verification code, a one-time password, a PIN.
The cells are drawn over one real input, which phones, password managers and paste fill in one go.

## Installation

```sh
npm install @3mo/code-field
```

```ts
import '@3mo/code-field'
```

## Usage

```html
<mo-field-code label='Verification code' length='6' type='numeric'></mo-field-code>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-code-field--types) — `type` limits the characters: digits, letters and digits, or letters only.
- [Grouped](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-code-field--grouped) — A separator groups a longer code so that it can be read back aloud; `separators` lists the positions it follows.
- [Pin](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-code-field--pin) — A PIN is masked, and `autoComplete='off'` keeps phones and password managers from offering to fill it.
- [Completion](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-code-field--completion) — One real input sits behind the cells, so pasting a code or accepting the one a phone offers fills them all at once.
- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-code-field--states) — Required, read-only and disabled.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-code-field--custom-properties) — The cells are sized by `--mo-field-code-cell-width` and `--mo-field-code-cell-height` and spaced by `--mo-field-code-gap`.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-code-field--parts) — The `cell`, `separator` and `label` parts can be restyled from outside.

## API

### `mo-field-code`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `length` | `length` | `number` | `6` | How many characters the code has. Defaults to six. |
| `type` | `type` | `FieldCodeType` | `"numeric"` | What the code is made of: "numeric" (default), "alphanumeric" or "alphabetic" |
| `pattern` | `pattern` | `string \| undefined` |  | A regular expression a character must match, in place of `type` |
| `separators` | `separators` | `number[] \| undefined` |  | The positions a separator follows, e.g. "[2]" for "123-456" |
| `separator` | `separator` | `string \| undefined` |  | The separator itself |
| `mask` | `mask` | `string \| undefined` |  | Shown in place of every entered character, e.g. "•" for a PIN |
| `autoComplete` | `autoComplete` | `string \| undefined` |  | Defaults to "one-time-code". Set "off" for a code no phone should offer. |
| `value` | `value` | `string \| undefined` |  | The characters entered so far |
| `label` | `label` | `string` | `"t('Code')"` | The field's label |
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

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-field-code-cell-width` | The width of a cell |
| `--mo-field-code-cell-height` | The height of a cell |
| `--mo-field-code-gap` | The space between the cells |
| `--mo-field-background` | The background of the cells |

#### CSS parts

| Name | Description |
| --- | --- |
| `label` | The field's label |
| `group` | The row of cells |
| `input` | The input holding the value |
| `cell` | One character's cell |
| `separator` | A separator between two cells |
| `container` | Field's container |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-code-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-code-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/CodeField)

## License

MIT © 3MO GmbH