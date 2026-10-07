# Color Picker

A web component for color pickers on the native color input, with typed values and optional preset swatches.

[![npm](https://img.shields.io/npm/v/@3mo/color-picker?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/color-picker) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-color-picker--overview)

A color swatch that opens the browser's color picker.

## Installation

```sh
npm install @3mo/color-picker
```

```ts
import '@3mo/color-picker'
```

## Usage

```html
<mo-color-picker></mo-color-picker>
```

## Examples

- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-color-picker--value) — The value is a `Color`.
- [Presets](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-color-picker--presets) — `presets` offers a list of colors in the browser's picker, in browsers that support it.

## API

### `mo-color-picker`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `Color \| undefined` |  | The current color. |
| `presets` | `presets` | `(string \| Color)[] \| undefined` |  | A list of preset colors. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input` | `Color \| undefined` | Dispatched when the user changes the color. |
| `change` | `Color \| undefined` | Dispatched when the user commits the color. |

#### CSS parts

| Name | Description |
| --- | --- |
| `input` | The native color input |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-color-picker--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-color-picker--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ColorPicker)

## License

MIT © 3MO GmbH
