# Field

A web component for the shared field frame with a floating label and start and end slots, plus the base classes of every field.

[![npm](https://img.shields.io/npm/v/@3mo/field?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/field) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-field--overview)

The frame every field is drawn in: a floating label, a background and an underline around its content.

## Installation

```sh
npm install @3mo/field
```

```ts
import '@3mo/field'
```

## Usage

```html
<mo-field label='Website' populated>
	<input value='3mo.de'>
</mo-field>
```

## Examples

- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field--states) — The frame draws only what its host tells it: `populated` lifts the label, `active` adds the accent line, `invalid` turns it red and `dense` makes the label a placeholder.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field--slots) — `start` and `end` hold icons, units or buttons beside the content.
- [Custom Content](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field--custom-content) — The default slot takes any control, here a native `<select>`, restyled to match.
- [Custom Field](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field--custom-field) — A field of your own extends `InputFieldComponent`, which renders this frame and brings the value, events, focus and validation.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field--custom-properties) — `--mo-field-background` replaces the background, and the corner radii follow `--mo-field-border-start-start-radius` and `--mo-field-border-start-end-radius`.

## API

### `mo-field`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `label` | `string` | `""` | The label, which floats above the content once it is populated or active |
| `readonly` | `readonly` | `boolean` | `false` | Hides the caret in the content |
| `disabled` | `disabled` | `boolean` | `false` | Fades the field and makes it ignore the pointer |
| `required` | `required` | `boolean` | `false` | Marks the label with an asterisk |
| `dense` | `dense` | `boolean` | `false` | Drops the padding and turns the label into a placeholder |
| `populated` | `populated` | `boolean` | `false` | Whether the content holds a value, which lifts the label |
| `invalid` | `invalid` | `boolean` | `false` | Turns the label, caret and underline red |
| `active` | `active` | `boolean` | `false` | Whether the content has focus, which draws the label and underline in the accent color |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-field-background` | The field's background color |
| `--mo-field-border-start-start-radius` | The radius of the top corner at the start |
| `--mo-field-border-start-end-radius` | The radius of the top corner at the end |

#### CSS parts

| Name | Description |
| --- | --- |
| `container` | The box holding the label and the content |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Field)

## License

MIT © 3MO GmbH
