# Line

A web component for horizontal or vertical separator lines, optionally labelled in the middle.

[![npm](https://img.shields.io/npm/v/@3mo/line?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/line) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-line--overview)

A separator line, optionally with a label in its middle.

## Installation

```sh
npm install @3mo/line
```

```ts
import '@3mo/line'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-line></mo-line>
```

## Examples

- [Label](https://3mo-esolutions.github.io/web-components/?path=/story/layout-line--label) — Content becomes a label in the middle of the line.
- [Color](https://3mo-esolutions.github.io/web-components/?path=/story/layout-line--color) — The line and its label follow `color`.
- [Vertical](https://3mo-esolutions.github.io/web-components/?path=/story/layout-line--vertical) — `direction='vertical'` separates items side by side and fills the height of its container, with or without a label.

## API

### `mo-line`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | `direction` | `"horizontal" \| "vertical"` | `"horizontal"` | Whether the line runs horizontally, the default, or vertically |

#### Slots

| Name | Description |
| --- | --- |
| (default) | A label in the middle of the line |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-line--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-line--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Line)

## License

MIT © 3MO GmbH