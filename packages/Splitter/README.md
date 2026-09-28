# Splitter

Web components for panes resized by dragging a line or knob between them, horizontally or vertically.

[![npm](https://img.shields.io/npm/v/@3mo/splitter?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/splitter) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-splitter--overview)

A layout of items the user resizes by dragging the resizers between them.

## Installation

```sh
npm install @3mo/splitter
```

```ts
import '@3mo/splitter'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-splitter direction='horizontal' style='height: 500px'>
	<mo-splitter-item size='60%'>
		<div style='background: rgba(0, 128, 128, 0.3)'>Item 1</div>
	</mo-splitter-item>
	<mo-splitter-item>
		<div style='background: rgba(255, 192, 203, 0.3)'>Item 2</div>
	</mo-splitter-item>
</mo-splitter>
```

## Examples

- [Directions](https://3mo-esolutions.github.io/web-components/?path=/story/layout-splitter--directions) — The four directions, in order: `horizontal`, `horizontal-reversed`, `vertical`, which is the default, and `vertical-reversed`.
- [Sizes](https://3mo-esolutions.github.io/web-components/?path=/story/layout-splitter--sizes) — `size` sets where an item starts and `min` how far it can shrink - drag either resizer toward the narrow items to feel them stop.
- [Nested](https://3mo-esolutions.github.io/web-components/?path=/story/layout-splitter--nested) — A splitter inside an item splits it again, along the other direction or the same one.
- [Collapsible Items](https://3mo-esolutions.github.io/web-components/?path=/story/layout-splitter--collapsible-items) — A `collapsed` item shrinks to its content and gives its space to the others; here each card collapses the item it sits in.
- [Custom Resizer](https://3mo-esolutions.github.io/web-components/?path=/story/layout-splitter--custom-resizer) — `resizerTemplate` replaces the knob between the items, here with `mo-splitter-resizer-line`.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-splitter--custom-properties) — The knob and the line take their colors from custom properties, and the line also its thickness.

## API

### `mo-splitter`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | `direction` | `FlexDirection` | `"vertical"` | The direction in which the items are laid out; vertical by default |
| `resizerTemplate` | `resizerTemplate` | `HTMLTemplateResult` |  | The template of the resizer between two items; `mo-splitter-resizer-knob` by default |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The `mo-splitter-item` elements |

#### CSS parts

| Name | Description |
| --- | --- |
| `resizer-host` | The element around each resizer |

### `mo-splitter-item`

An item of a splitter, resized by the resizers beside it.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `string \| undefined` |  | The initial size along the splitter's direction, such as `60%`; the last item takes the rest |
| `min` | `min` | `string \| undefined` |  | The minimum size along the splitter's direction |
| `collapsed` | `collapsed` | `boolean` | `false` | Whether the item shrinks to its content and leaves its space to the others |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the item |

### `mo-splitter-resizer-host`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `direction` | `direction` | `FlexDirection \| undefined` |  |
| `resizing` | `resizing` | `boolean` | `false` |
| `collapsed` | `collapsed` | `boolean` | `false` |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `resizeStart` | `void` |  |
| `resize` | `{ readonly x: number; readonly y: number; }` | Where the pointer is while resizing, in client coordinates. |
| `resizeStop` | `void` |  |

### `mo-splitter-resizer-knob`

A rounded knob between two splitter items, the default resizer.

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `hostDirection` | `hostDirection` | `FlexDirection \| undefined` |  |
| `hostResizing` | `hostResizing` | `boolean` | `false` |
| `hostHover` | `hostHover` | `boolean` | `false` |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-splitter-resizer-knob-background` | The color of the knob |
| `--mo-splitter-resizer-knob-active-background` | The color of the knob while hovered or dragged |

### `mo-splitter-resizer-line`

A thin line between two splitter items, as an alternative resizer.

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `hostDirection` | `hostDirection` | `FlexDirection \| undefined` |  |
| `hostResizing` | `hostResizing` | `boolean` | `false` |
| `hostHover` | `hostHover` | `boolean` | `false` |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-splitter-resizer-line-thickness` | The thickness of the line |
| `--mo-splitter-resizer-line-idle-background` | The color of the line |
| `--mo-splitter-resizer-line-accent-color` | The color of the line while hovered or dragged |
| `--mo-splitter-resizer-line-transition-quick` | The transition of the line |
| `--mo-splitter-resizer-line-vertical-transform` | The transform of a line between vertically laid out items while hovered or dragged |
| `--mo-splitter-resizer-line-horizontal-transform` | The transform of a line between horizontally laid out items while hovered or dragged |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-splitter--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-splitter--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Splitter)

## License

MIT © 3MO GmbH