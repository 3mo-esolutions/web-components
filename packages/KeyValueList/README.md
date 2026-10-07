# Key Value List

A web component for key-value pairs laid out as a description list in as many columns as fit.

[![npm](https://img.shields.io/npm/v/@3mo/key-value-list?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/key-value-list) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-key-value-list--overview)

A list of key–value pairs, laid out as a description list which fills the width it is given with as many
key–value columns as fit into it.

## Installation

```sh
npm install @3mo/key-value-list
```

```ts
import '@3mo/key-value-list'
```

## Usage

```html
<mo-key-value-list minColumnWidth='380' stackingWidth='285'>
	<mo-key-value key='Camera'>Fujifilm X-T5</mo-key-value>
	<mo-key-value key='Lens'>XF 35mm F1.4 R</mo-key-value>
	<mo-key-value key='Focal length'>35 mm</mo-key-value>
	<mo-key-value key='Aperture'>f/2.0</mo-key-value>
	<mo-key-value key='Shutter speed'>1/250 s</mo-key-value>
	<mo-key-value key='ISO'>400</mo-key-value>
	<mo-key-value key='Taken'>14.06.2026, 18:42</mo-key-value>
	<mo-key-value key='Dimensions'>7728 × 5152</mo-key-value>
</mo-key-value-list>
```

## Examples

- [Responsiveness](https://3mo-esolutions.github.io/web-components/?path=/story/data-key-value-list--responsiveness) — The list fills its width with as many key–value columns as fit, here three, two and one, and at or below `stackingWidth` places each key above its value.
- [Always Stacked](https://3mo-esolutions.github.io/web-components/?path=/story/data-key-value-list--always-stacked) — `alwaysStacked` places every key above its value however wide the list is.
- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/data-key-value-list--value) — `value` takes a value that needs no markup, and is where `bind()` writes by default.
- [Empty Values](https://3mo-esolutions.github.io/web-components/?path=/story/data-key-value-list--empty-values) — A pair without a value shows a placeholder, unless `hiddenWhenEmpty` takes it out of the list.
- [Rich Values](https://3mo-esolutions.github.io/web-components/?path=/story/data-key-value-list--rich-values) — Values take any content, and so do keys through the `key` slot.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/data-key-value-list--custom-properties) — The gaps, the dividers and the tracks of a column are custom properties, here for a dense list in a card.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/data-key-value-list--parts) — The `key` and `value` parts of each pair restyle its typography.

## API

### `mo-key-value-list`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `minColumnWidth` | `minColumnWidth` | `number` | `380` | The width in pixels below which a key–value column may not shrink. The list drops a column instead. Defaults to 380. |
| `stackingWidth` | `stackingWidth` | `number` | `285` | The width in pixels at or below which every pair places its key above its value. Defaults to 285. |
| `alwaysStacked` | `alwaysStacked` | `boolean` | `false` | Whether every pair places its key above its value regardless of the width available. |
| `stacked` | `stacked` | `boolean` |  | Whether the pairs are stacked. Derived from the width and therefore read-only. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The pairs of the list. Meant for "mo-key-value" elements, as only those subscribe to its columns. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-key-value-list-column-template` | The tracks of a single key–value column, repeated once per column. Defaults to "minmax(max-content, 1fr) 2fr". |
| `--mo-key-value-list-column-gap` | The gap between two key–value columns. Defaults to "0.75rem". |
| `--mo-key-value-list-row-gap` | The gap between two pairs. Defaults to "0.75rem". |
| `--mo-key-value-list-divider-color` | The color of the dividers drawn between pairs and between columns. |

### `mo-key-value`

A single key–value pair of a "mo-key-value-list".

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `key` | `key` | `string \| undefined` |  | The name of the pair. Superseded by the "key" slot. |
| `value` | `value` | `string \| undefined` |  | The value of the pair, for one which needs no markup. Superseded by the default slot, and the property "bind()" writes into by default. |
| `hiddenWhenEmpty` | `hiddenWhenEmpty` | `boolean` | `false` | Whether the pair takes itself out of the list while its value is empty, instead of showing a placeholder. |
| `empty` | `empty` | `boolean` |  | Whether the value is empty. Derived from the slotted content and therefore read-only. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The value of the pair. A placeholder stands in for it while it is empty. |
| `key` | The name of the pair, for when it takes more than the text of the "key" attribute. |

#### CSS parts

| Name | Description |
| --- | --- |
| `key` | The element holding the name of the pair. |
| `value` | The element holding the value of the pair. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-key-value-list--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-key-value-list--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/KeyValueList)

## License

MIT © 3MO GmbH
