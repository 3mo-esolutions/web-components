# Virtualized List

A web component for virtualized lists that render list items from data only while they are in view.

[![npm](https://img.shields.io/npm/v/@3mo/virtualized-list?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/virtualized-list) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-virtualized-list--overview)

A list that renders list items from an array, only while they are near the viewport, so it scrolls through thousands.

## Installation

```sh
npm install @3mo/virtualized-list
```

```ts
import '@3mo/virtualized-list'
```

## Usage

```html
<mo-virtualized-list style='height: 500px'
	.data=${Array.from({ length: 1000 }, (_, index) => `Item ${index + 1}`)}
	.getItemTemplate=${(item: string) => html`<mo-list-item>${item}</mo-list-item>`}
></mo-virtualized-list>
```

## Examples

- [Selection](https://3mo-esolutions.github.io/web-components/?path=/story/data-virtualized-list--selection) — Only the items near the viewport are rendered, and they are recycled as it scrolls, so state such as the selection lives outside them - select a few, scroll away and back.

## API

### `mo-virtualized-list`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | `data` | `T[]` | `"new Array<T>()"` | The items, one list item each. |
| `getItemTemplate` | `getItemTemplate` | `GetItemTemplate<T>` | `"(() => html.nothing)"` | A function that returns the list item of an item. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `itemsChange` | `HTMLElement[]` | Dispatched when the list items change |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The list items. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-virtualized-list--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-virtualized-list--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/VirtualizedList)

## License

MIT © 3MO GmbH