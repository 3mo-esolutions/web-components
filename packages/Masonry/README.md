# Masonry

A web component for native CSS masonry layouts in columns or rows, falling back to a regular grid where unsupported.

[![npm](https://img.shields.io/npm/v/@3mo/masonry?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/masonry) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-masonry--overview)

A layout that packs items of different sizes into lanes, falling back to a regular grid where the browser lacks native CSS masonry.

## Installation

```sh
npm install @3mo/masonry
```

```ts
import '@3mo/masonry'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-masonry columns='4' gap='10px' tolerance='1em'>
	${[90, 190, 120, 60, 220, 140, 80, 170, 110, 200, 70, 150, 100, 180, 130, 120].map((height, index) => html`
		<div style='height: ${height}px'>${index + 1}</div>
	`)}
</mo-masonry>
```

## Examples

- [Brick](https://3mo-esolutions.github.io/web-components/?path=/story/layout-masonry--brick) — `rows` instead of `columns` flips the masonry sideways into a »brick« layout that fills rows of a given height.
- [Gallery](https://3mo-esolutions.github.io/web-components/?path=/story/layout-masonry--gallery) — Photos of different heights in as many columns as fit - resize the window to watch them reflow.
- [Tolerance](https://3mo-esolutions.github.io/web-components/?path=/story/layout-masonry--tolerance) — `tolerance` counts lanes within that distance as ties, resolved in item order: `0` packs the tightest, `infinity` keeps the order.
- [Spanning Items](https://3mo-esolutions.github.io/web-components/?path=/story/layout-masonry--spanning-items) — Items can span several lanes with `grid-column`, such as `1 / -1` across all of them or `span 2`.

## API

### `mo-masonry`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `columns` | `columns` | `number \| GridTemplateColumns<string>` |  | Lanes of a vertical »waterfall« masonry, tunneled to `grid-template-columns`. Additionally accepts a bare lane count (e.g. `4` equals `repeat(4, 1fr)`). |
| `rows` | `rows` | `number \| GridTemplateRows<string>` |  | Lanes of a horizontal »brick« masonry, tunneled to `grid-template-rows`. Defining these instead of `columns` flips the masonry to flow sideways. |
| `rowGap` | `rowGap` | `RowGap<string>` |  | Tunnels `row-gap` CSS property. |
| `columnGap` | `columnGap` | `ColumnGap<string>` |  | Tunnels `column-gap` CSS property. |
| `gap` | `gap` | `Gap<string>` |  | Tunnels `gap` CSS property. |
| `tolerance` | `tolerance` | `string` |  | Placement tolerance tunneled to `flow-tolerance` / `item-tolerance`. `0` always packs items into the shortest lane while larger values preserve more of the natural item order. Defaults to `1em`. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the masonry container. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-masonry--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-masonry--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Masonry)

## License

MIT © 3MO GmbH