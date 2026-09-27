# Field Pair

A web component for pairing a field with an attachment, such as a unit picker, into one control side by side or overlaid.

[![npm](https://img.shields.io/npm/v/@3mo/field-pair?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/field-pair) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-field-pair--overview)

A field joined with an attachment, such as a unit or a country code, into one seamless control.

## Installation

```sh
npm install @3mo/field-pair
```

```ts
import '@3mo/field-pair'
```

## Usage

```html
<mo-field-pair mode='attach'>
	<mo-field-number label='Weight' value='12'></mo-field-number>
	<mo-field-select slot='attachment' value='kg'>
		<mo-option value='kg'>kg</mo-option>
		<mo-option value='lb'>lb</mo-option>
	</mo-field-select>
</mo-field-pair>
```

## Examples

- [Reversed](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field-pair--reversed) — `reversed` puts the attachment first, like a country code before a phone number.
- [Overlay](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field-pair--overlay) — `mode='overlay'` lays the attachment over the field's top corner instead of beside it, which suits a text area.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-field-pair--custom-properties) — `--mo-field-pair-attachment-width` sizes the attachment, 100px by default.

## API

### `mo-field-pair`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `mode` | `mode` | `FieldPairMode` | `"attach"` | `attach` places the attachment beside the field, `overlay` lays it over the field's top corner at the end |
| `reversed` | `reversed` | `boolean` | `false` | Puts the attachment before the field |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field |
| `attachment` | The field attached to it |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-field-pair-attachment-width` | The attachment's width, 100px by default |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-field-pair--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-field-pair--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FieldPair)

## License

MIT © 3MO GmbH