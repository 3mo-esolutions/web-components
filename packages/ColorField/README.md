# Color Field

A web component for color fields that take hex text or a pick from an inline color picker.

[![npm](https://img.shields.io/npm/v/@3mo/color-field?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/color-field) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-color-field--overview)

A field for a color, typed as a hex code or picked from a swatch that opens the browser's color picker.

## Installation

```sh
npm install @3mo/color-field
```

```ts
import '@3mo/color-field'
```

## Usage

```html
<mo-field-color label='Brand color'></mo-field-color>
```

## Examples

- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-color-field--value) — The value is a `Color`, shown as its hex code.
- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-color-field--states) — Required, read-only, disabled and dense.

## API

### `mo-field-color`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `Color \| undefined` |  | The field's value |
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

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-color-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-color-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ColorField)

## License

MIT © 3MO GmbH
