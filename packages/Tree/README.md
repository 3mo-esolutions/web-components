# Tree

Web components for ARIA tree views of nested items to browse, open and select, plus the controller for custom trees.

[![npm](https://img.shields.io/npm/v/@3mo/tree?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/tree) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-tree--overview)

A hierarchy to browse and select from, written as nested `mo-tree-item`s.

## Installation

```sh
npm install @3mo/tree
```

```ts
import '@3mo/tree'
```

## Usage

```html
<mo-tree style='max-width: 24rem'>
	<mo-tree-item value='documents' icon='folder'>
		Documents
		<mo-tree-item value='taxes' icon='folder'>
			Taxes
			<mo-tree-item value='2025.pdf' icon='picture_as_pdf'>2025.pdf</mo-tree-item>
			<mo-tree-item value='2026.pdf' icon='picture_as_pdf'>2026.pdf</mo-tree-item>
		</mo-tree-item>
		<mo-tree-item value='notes.md' icon='description'>Notes.md</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='pictures' icon='folder'>
		Pictures
		<mo-tree-item value='beach.jpg' icon='image'>Beach.jpg</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='readme.txt' icon='description'>Readme.txt</mo-tree-item>
</mo-tree>
```

## Examples

- [Selection](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--selection) — Without `selectability` a click opens a row; with `single` or `multiple` it selects, and the chevron opens.
- [Initial State](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--initial-state) — An item's `open` and `selected` set where it starts, and a `disabled` one is neither selected nor reached by the keyboard.
- [Controlled](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--controlled) — The selection is the tree's `value` and what is open each item's own `open`, both held in state here.
- [Methods](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--methods) — `expandAll()`, `collapseAll()`, `selectAll()` and `deselectAll()` act on the whole tree, and `reveal()` opens the way to an item.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--slots) — `icon` takes a Material icon, which the `start` slot replaces; the `end` slot places content after the label.
- [Overflow](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--overflow) — A label that does not fit is truncated with an ellipsis.
- [Keyboard](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--keyboard) — Arrows move and open, Home and End jump, `*` opens every sibling, Space selects, Shift+arrows extend, Ctrl+A selects all and typing jumps to a matching item.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--parts) — `::part(row)` sets a row's height, indentation and guide lines, and `::part(group)` the slide of the nested items: the default, a dense tree, and one without guides or motion.
- [Controller](https://3mo-esolutions.github.io/web-components/?path=/story/data-tree--controller) — `TreeController` alone, on plain `div`s: the host supplies the roots and their children, and hides a closed item's children itself.

## Accessibility

A `tree`, with `aria-multiselectable` while multiple. Items are `treeitem`s with `aria-level`, `aria-setsize` and `aria-posinset`, `aria-expanded` on parents, `aria-selected` while the tree has a `selectability`, and `aria-disabled`; children sit in a `group`. Focus roves over the visible items.

| Key | Does |
| --- | --- |
| `ArrowDown` `ArrowUp` | The next or previous visible item. |
| `ArrowRight` | Opens a closed parent, or moves to the first child of an open one. |
| `ArrowLeft` | Closes an open parent, or moves to the parent. |
| `Home` `End`, `PageUp` `PageDown` | The first or last visible item, or a page further. |
| `*` | Opens every sibling of the item. |
| A letter | Typeahead. |
| `Enter` | Clicks the item: selects it, or opens and closes a parent while the tree has no `selectability`. |
| `Space` | With a `selectability`: selects the item, or toggles it while multiple. |
| `Shift` + an arrow, `Ctrl` `A` | Multiple: extends the selection, or selects all. |

The arrows stop at the ends rather than wrapping. Name the tree with `aria-label` or `aria-labelledby`.

## API

### `mo-tree`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `items` |  | `TreeItem[]` |  | The root items. |
| `selectability` | `selectability` | `Selectability \| undefined` |  | `single` or `multiple`; unset, items are not selectable and a click opens instead. |
| `value` | `value` | `string \| string[] \| undefined` |  | The selected item, or the selected items while `multiple`. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `string \| string[] \| undefined` | The new value, whenever the selection changes through the tree. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The items. |

### `mo-tree-item`

A row of a `mo-tree` and the group of the `mo-tree-item`s nested in it.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `items` |  | `TreeItem[]` |  | The nested items. |
| `value` | `value` | `string \| undefined` |  | What the tree reports this item as. An item without one is not in the tree's `value`. |
| `open` | `open` | `boolean` | `false` | Whether the nested items are shown. |
| `selected` | `selected` | `boolean` | `false` | Whether the item starts out selected. |
| `disabled` | `disabled` | `boolean` | `false` | Neither navigable nor selectable. |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | An icon before the content. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Whether the nested items are shown, whenever that changes. It bubbles, which is how the tree follows its items. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the row. |
| `start` | Placed before the content, in place of the icon. |
| `end` | Placed after the content. |
| `children` | The nested items, which a `mo-tree-item` child joins on its own. |

#### CSS parts

| Name | Description |
| --- | --- |
| `row` | The row: the item without its nested items. |
| `indicator` | The chevron which opens and closes the row. |
| `group` | What the nested items sit in, and what slides and fades as the row opens and closes. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-tree--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-tree--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Tree)

## License

MIT © 3MO GmbH
