# Symbol

A web component for typed Material Symbols with adjustable fill, weight, grade and optical size.

[![npm](https://img.shields.io/npm/v/@3mo/symbol?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/symbol) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-symbol--overview)

A Material symbol, drawn from the variable Material Symbols font by name.

## Installation

```sh
npm install @3mo/symbol
```

```ts
import '@3mo/symbol'
```

## Usage

```html
<mo-symbol icon='verified' variant='rounded'></mo-symbol>
```

## Examples

- [Variants](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-symbol--variants) — Each variant is a font of its own, loaded the first time a symbol uses it.
- [Fill](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-symbol--fill) — `fill='1'` fills the outline, e.g. to mark the active item of a navigation.
- [Axes](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-symbol--axes) — `fill`, `weight`, `grade` and `opticalScale` are axes of the variable font - drag the controls.
- [Styling](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-symbol--styling) — A symbol is a glyph: `font-size` sizes it, 24px by default, and `color` colors it.
- [All Symbols](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-symbol--all-symbols) — Every symbol name the `icon` attribute accepts - its type completes them in the editor.

## API

### `mo-symbol`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `SymbolVariant` | `"defaultVariant"` | The style, each a font of its own: `rounded` (default), `outlined` or `sharp`. |
| `icon` | `icon` | `MaterialSymbol \| undefined` |  | The name of the symbol, e.g. `delete`. |
| `fill` | `fill` | `string \| undefined` | `"defaultFill"` | `1` fills the symbol, `0` outlines it. |
| `weight` | `weight` | `string \| undefined` | `"defaultWeight"` | The stroke weight, from `100` to `700`. |
| `grade` | `grade` | `string \| undefined` | `"defaultGrade"` | Fine-tunes the stroke thickness without changing the size, from `-50` to `200`. |
| `opticalScale` | `opticalScale` | `string \| undefined` | `"defaultOpticalScale"` | The size in pixels the strokes are optimized for, from `20` to `48`. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-symbol--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-symbol--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Symbol)

## License

MIT © 3MO GmbH