# Context Menu

Web components for context menus that open at the pointer on right-click, attachable to any element through a directive.

[![npm](https://img.shields.io/npm/v/@3mo/context-menu?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/context-menu) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-context-menu--overview)

A menu opened at the pointer by a right-click on its anchor, usually attached with the `contextMenu` directive.

## Installation

```sh
npm install @3mo/context-menu
```

```ts
import '@3mo/context-menu'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<div style='display: inline-flex; align-items: center; gap: 8px; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'
	${contextMenu(() => html`
		<mo-context-menu-item icon='open_in_new'>Open</mo-context-menu-item>
		<mo-context-menu-item icon='edit'>Rename</mo-context-menu-item>
		<mo-context-menu-item icon='delete'>Delete</mo-context-menu-item>
	`)}
>
	<mo-icon icon='description'></mo-icon>
	Invoice 2026-08.pdf
</div>
```

## Examples

- [Item Content](https://3mo-esolutions.github.io/web-components/?path=/story/actions-context-menu--item-content) — Items take any content, such as a shortcut hint after a label that fills the row, and `mo-line` separates groups.
- [Submenus](https://3mo-esolutions.github.io/web-components/?path=/story/actions-context-menu--submenus) — Items in the `submenu` slot of an item open beside it, on hover or with ArrowRight, and nest further.
- [Nested Areas](https://3mo-esolutions.github.io/web-components/?path=/story/actions-context-menu--nested-areas) — Areas nest: a right-click opens the menu of the innermost one, and opening one menu closes any other.

## Accessibility

It opens on the `contextmenu` event, which the context-menu key fires as well, and `Shift` `F10` on some systems, so make its anchor focusable. Inside, it is a [menu](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-menu-controller--overview).

## API

### `mo-context-menu`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `anchor` | `anchor` | `HTMLElement` |  | The element that the menu is anchored to. |
| `placement` | `placement` | `PopoverPlacement \| undefined` |  | The placement of the menu. |
| `alignment` | `alignment` | `PopoverAlignment \| undefined` |  | How the menu lines up with its anchor: `start`, `center` or `end`. |
| `open` | `open` | `boolean` | `false` | Whether the menu is open. |
| `target` | `target` | `string \| undefined` |  | The target of the menu. |
| `manual` | `manual` | `true` | `true` | Whether the menu is opened manually. This won't affect the opening triggers via the keyboard. |
| `preventOpenOnAnchorEnter` | `preventOpenOnAnchorEnter` | `boolean` | `false` | Whether the menu should not open when the Enter key is pressed on the anchor. |
| `selectability` | `selectability` | `Selectability` | `"multiple"` | The selectability of the menu. Default is `multiple`. |
| `value` | `value` | `number[] \| undefined` |  | The value of the menu. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the menu is disabled. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `number[]` | Dispatched when the menu value changes. |
| `openChange` | `boolean` | Dispatched when the menu open state changes. |
| `itemsChange` | `(ListItem & HTMLElement)[]` | Dispatched when the menu items change. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The menu items. |

#### CSS parts

| Name | Description |
| --- | --- |
| `popover` | The popover part of the menu. |
| `list` | The list part of the menu. |

### `mo-context-menu-item`

An item of a `mo-context-menu`, which opens the items in its `submenu` slot as a submenu.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the submenu is open. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Slots

| Name | Description |
| --- | --- |
| `submenu` | The items of the submenu. |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-context-menu--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-context-menu--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ContextMenu)

## License

MIT © 3MO GmbH