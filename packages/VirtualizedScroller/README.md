# Virtualized Scroller

A web component for scroll containers that render only the visible items of a large array, built on Lit Virtualizer.

[![npm](https://img.shields.io/npm/v/@3mo/virtualized-scroller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/virtualized-scroller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-virtualized-scroller--overview)

A scroller that renders only the items near its viewport, for lists of thousands.

## Installation

```sh
npm install @3mo/virtualized-scroller
```

```ts
import '@3mo/virtualized-scroller'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-virtualized-scroller style='height: 400px'
	.items=${Array.from({ length: 1000 }, (_, index) => index + 1)}
	.getItemTemplate=${(number: number) => html`<div style='padding: 10px'>Item ${number}</div>`}
></mo-virtualized-scroller>
```

## Examples

- [Variable Heights](https://3mo-esolutions.github.io/web-components/?path=/story/layout-virtualized-scroller--variable-heights) — Items of different heights are measured as they render, so a hundred thousand of them still scroll smoothly.
- [Scroll To Item](https://3mo-esolutions.github.io/web-components/?path=/story/layout-virtualized-scroller--scroll-to-item) — `getElement(index)` returns an item even when it is not rendered, so that it can be scrolled into view.

## API

### `mo-virtualized-scroller`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `items` | `T[]` | `"new Array<T>()"` | The items to render, all of them |
| `getItemTemplate` | `getItemTemplate` | `GetItemTemplate<T>` | `"(() => html.nothing)"` | Renders an item, given the item and its index |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-virtualized-scroller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-virtualized-scroller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/VirtualizedScroller)

## License

MIT © 3MO GmbH