# Flex

A web component for flexbox layouts with direction, wrap, gap and alignment as attributes.

[![npm](https://img.shields.io/npm/v/@3mo/flex?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/flex) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-flex--overview)

A flex container whose attributes set the flexbox properties of its host.

## Installation

```sh
npm install @3mo/flex
```

```ts
import '@3mo/flex'
```

## Usage

```html
<mo-flex direction='horizontal' gap='10px' justifyContent='normal' alignItems='stretch' style='height: 300px'>
	<div>1</div>
	<div>2</div>
	<div>3</div>
	<div>4</div>
</mo-flex>
```

## Examples

- [Sizing](https://3mo-esolutions.github.io/web-components/?path=/story/layout-flex--sizing) — `flex` on an item shares out the free space: `2` takes twice what `1` takes, while `auto` and `100px` keep their size.
- [Directions](https://3mo-esolutions.github.io/web-components/?path=/story/layout-flex--directions) — The four directions, in order: `horizontal`, `horizontal-reversed`, `vertical`, which is the default, and `vertical-reversed`.
- [Wrap](https://3mo-esolutions.github.io/web-components/?path=/story/layout-flex--wrap) — `wrap='wrap'` continues items that do not fit on a new line, and `alignContent` places the lines.
- [Alignment](https://3mo-esolutions.github.io/web-components/?path=/story/layout-flex--alignment) — `justifyContent` and `alignItems` place the items, here a heading and its actions at the two ends of a row.

## API

### `mo-flex`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | `direction` | `FlexDirection` |  | The direction items flow in, mapped to `flex-direction`; vertical by default |
| `wrap` | `wrap` | `FlexWrap` |  | Whether items wrap onto multiple lines, mapped to `flex-wrap` |
| `gap` | `gap` | `Gap<string>` |  | The gap between items, mapped to `gap` |
| `justifyItems` | `justifyItems` | `JustifyItems` |  | Mapped to `justify-items` |
| `justifyContent` | `justifyContent` | `JustifyContent` |  | Places the items along the main axis, mapped to `justify-content` |
| `alignItems` | `alignItems` | `AlignItems` |  | Places the items along the cross axis, mapped to `align-items` |
| `alignContent` | `alignContent` | `AlignContent` |  | Places the lines of wrapped items, mapped to `align-content` |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the flex container. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-flex--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-flex--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Flex)

## License

MIT © 3MO GmbH