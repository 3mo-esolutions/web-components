# Reorderability

A Lit controller for reordering items by dragging with mouse, touch or pen, reading the layout from the items themselves.

[![npm](https://img.shields.io/npm/v/@3mo/reorderability?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/reorderability) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-reorderability--overview)

## Installation

```sh
npm install @3mo/reorderability
```

```ts
import { ReorderabilityController } from '@3mo/reorderability'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--default) — Drag an item, or on touch hold it first, so a plain swipe still scrolls.
- [Wrapping Grid](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--wrapping-grid) — Items that wrap onto several lines are hit-tested rather than ordered along one axis.
- [Horizontal Row](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--horizontal-row) — A horizontal scroller, which scrolls by itself as a drag nears its edges.
- [Right To Left](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--right-to-left) — The same row written right to left: the order is read off the items' positions, so nothing about direction is configured.
- [Indicator Strategy](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--indicator-strategy) — `strategy: 'indicator'` leaves the items in place, stamps `drop-before` or `drop-after` on the target and drags a `dragImage` preview.
- [Drag Handle](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--drag-handle) — `handle` confines the grab to a descendant, here the grip icon.
- [Disabled Items](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--disabled-items) — Disabled items can be neither grabbed nor dropped onto, but still move aside for a reorder around them.
- [Items With Their Own Controls](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--items-with-their-own-controls) — `excluded: '.actions'` keeps each row's own buttons out of the drag, so the whole row drags and its controls keep their clicks.
- [Board Of Independent Lists](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-reorderability--board-of-independent-lists) — One controller per column: a card reorders within its column and never travels into another.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `ReorderabilityController` | class | Drag-to-reorder for items declared inline in a template. |
| `ReorderabilityState` | enum |  |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-reorderability--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-reorderability--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Reorderability)

## License

MIT © 3MO GmbH