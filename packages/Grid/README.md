# Grid

A web component for CSS grid layouts with rows, columns, gaps, auto-flow and alignment as attributes.

[![npm](https://img.shields.io/npm/v/@3mo/grid?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/grid) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-grid--overview)

A grid container whose attributes set the grid properties of its host.

## Installation

```sh
npm install @3mo/grid
```

```ts
import '@3mo/grid'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-grid columns='3* *' rows='60px * 50px' gap='10px' style='height: 400px'>
	<div style='grid-column: 1 / -1'>Header</div>
	<div>Main</div>
	<div>Sidebar</div>
	<div style='grid-column: 1 / -1'>Footer</div>
</mo-grid>
```

## Examples

- [Asterisk Syntax](https://3mo-esolutions.github.io/web-components/?path=/story/layout-grid--asterisk-syntax) — In `columns` and `rows`, `*` stands for `1fr` and `2*` for `2fr`.
- [Responsive](https://3mo-esolutions.github.io/web-components/?path=/story/layout-grid--responsive) — `repeat(auto-fit, minmax(150px, 1fr))` fits in as many columns as there is room for - resize the window to watch them reflow.
- [Gaps](https://3mo-esolutions.github.io/web-components/?path=/story/layout-grid--gaps) — `rowGap` and `columnGap` set the two gaps apart, where `gap` sets both.
- [Auto Flow](https://3mo-esolutions.github.io/web-components/?path=/story/layout-grid--auto-flow) — `autoFlow='column'` fills one column after the other, and `autoColumns` sizes the columns it adds.

## API

### `mo-grid`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `rows` | `rows` | `GridTemplateRows<string>` |  | The row tracks, mapped to `grid-template-rows`; `*` stands for `1fr` and `2*` for `2fr` |
| `columns` | `columns` | `GridTemplateColumns<string>` |  | The column tracks, mapped to `grid-template-columns`; `*` stands for `1fr` and `2*` for `2fr` |
| `autoRows` | `autoRows` | `GridAutoRows<string>` |  | The size of implicitly created rows, mapped to `grid-auto-rows` |
| `autoColumns` | `autoColumns` | `GridAutoColumns<string>` |  | The size of implicitly created columns, mapped to `grid-auto-columns` |
| `autoFlow` | `autoFlow` | `GridAutoFlow` |  | How items are placed automatically, mapped to `grid-auto-flow` |
| `rowGap` | `rowGap` | `RowGap<string>` |  | The gap between rows, mapped to `row-gap` |
| `columnGap` | `columnGap` | `ColumnGap<string>` |  | The gap between columns, mapped to `column-gap` |
| `gap` | `gap` | `Gap<string>` |  | The gap between rows and columns, mapped to `gap` |
| `justifyItems` | `justifyItems` | `JustifyItems` |  | Places the items in their cells along the inline axis, mapped to `justify-items` |
| `justifyContent` | `justifyContent` | `JustifyContent` |  | Places the tracks along the inline axis, mapped to `justify-content` |
| `alignItems` | `alignItems` | `AlignItems` |  | Places the items in their cells along the block axis, mapped to `align-items` |
| `alignContent` | `alignContent` | `AlignContent` |  | Places the tracks along the block axis, mapped to `align-content` |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the grid container. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-grid--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-grid--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Grid)

## License

MIT © 3MO GmbH