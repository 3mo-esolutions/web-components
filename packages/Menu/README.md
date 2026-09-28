# Menu

Web components for popup menus with plain, selectable, nested and navigation items, plus an ARIA menu button controller.

[![npm](https://img.shields.io/npm/v/@3mo/menu?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/menu) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-menu--overview)

A list of commands in a popover, opened from its anchor by a press or the keyboard.

## Installation

```sh
npm install @3mo/menu
```

```ts
import '@3mo/menu'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-popover-container>
	<mo-button type='outlined' endIcon='expand_more'>Actions</mo-button>
	<mo-menu slot='popover'>
		<mo-menu-item icon='edit'>Rename</mo-menu-item>
		<mo-menu-item icon='content_copy'>Duplicate</mo-menu-item>
		<mo-menu-item icon='delete'>Delete</mo-menu-item>
	</mo-menu>
</mo-popover-container>
```

## Examples

- [Placements](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--placements) — The `placement` of the container puts the menu on any side of its anchor, and flips it where there is no room.
- [Alignments](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--alignments) — The `alignment` of the container lines the menu up with the start, the center or the end of its anchor.
- [Item Content](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--item-content) — Items take any content, such as a shortcut hint after a label that fills the row; `mo-line` separates groups.
- [Submenus](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--submenus) — A `mo-nested-menu-item` opens the items in its `submenu` slot beside it, on hover or with ArrowRight; without any it is a plain item.
- [Selection](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--selection) — `mo-selectable-menu-item`s keep a selection: one at a time with `selectability='single'`, any number by default.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--disabled) — A disabled item ignores presses, and a disabled menu does not open.
- [Target](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--target) — `target` names the element inside the anchor that opens the menu; here only the icon-button does.
- [Anchor](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--anchor) — Without a container, `anchor` is set as a property, here by a component of your own that renders the button and its menu.
- [Manual](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--manual) — A `manual` menu opens only through `open` and stays open on a press outside; bind `open` and `openChange` to keep the state.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu--parts) — The `popover` and `list` parts can be restyled from outside.

### Menu Controller

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-menu-controller--default) — ↓, ↑, Home or End on the button opens the menu onto the first or last item; a click opens it with none active.
- [Selectable Items](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-menu-controller--selectable-items) — `selectability` announces items carrying their own `selected` as `menuitemradio` or `menuitemcheckbox`, and opening lands on the selected one.

## Accessibility

### `mo-menu`

A [menu button](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-menu-controller--overview): the anchor announces the menu, the items take real focus, and `Escape` returns focus to the anchor.
A `mo-selectable-menu-item` is a `menuitemcheckbox`, or a `menuitemradio` under `selectability='single'`, with `aria-checked`, `mixed` when indeterminate. A `mo-nested-menu-item` opens its submenu with `ArrowRight`, and `ArrowLeft` or `Escape` closes it again; the two arrows do not swap in a right-to-left language yet. A menu is named by its anchor.

### `MenuController`

The trigger gets `aria-haspopup='menu'` and `aria-expanded`; the menu is a `menu` labelled by its trigger, and its items are `menuitem`s.
Items take real focus. Opened by the keyboard, the menu focuses its selected item, else the first or last one; opened by a pointer, its selected item, else the menu itself. Closing returns focus to the trigger when focus was inside.

| Key | Does |
| --- | --- |
| `ArrowDown` `Home`, `Enter` `Space` | On the trigger: opens on the first item; `Enter` and `Space` where the trigger is a button. |
| `ArrowUp` `End` | On the trigger: opens on the last item. |
| `ArrowDown` `ArrowUp`, `Home` `End` | In the menu: the next, previous, first or last item, wrapping. |
| A letter | Typeahead. |
| `Enter` `Space` | Clicks the item; choosing one closes the menu. |
| `Escape` | Closes the menu and returns focus to the trigger. |
| `Tab` | Closes the menu and moves focus on, as focus leaving it does. |

## API

### `mo-menu`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `anchor` | `anchor` | `HTMLElement` |  | The element that the menu is anchored to. |
| `placement` | `placement` | `PopoverPlacement \| undefined` |  | The placement of the menu. |
| `alignment` | `alignment` | `PopoverAlignment \| undefined` |  | How the menu lines up with its anchor: `start`, `center` or `end`. |
| `open` | `open` | `boolean` | `false` | Whether the menu is open. |
| `target` | `target` | `string \| undefined` |  | The target of the menu. |
| `manual` | `manual` | `boolean` | `false` | Whether the menu is opened manually. This won't affect the opening triggers via the keyboard. |
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

### `mo-menu-item`

A command in a `mo-menu`.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-navigation-menu-item`

An item of a `mo-menu` that navigates, highlighted while its route is the current one.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-nested-menu-item`

An item of a `mo-menu` that opens the items in its `submenu` slot as a menu beside it.

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

### `mo-selectable-menu-item`

An item of a `mo-menu` that the menu selects and deselects, one at a time or several at once.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `toggleable` | `toggleable` | `boolean` | `false` | Whether the list item selection can be toggled on and off |
| `selected` | `selected` | `boolean` | `false` | Whether the list item is selected |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` |  | Dispatched when the list item is selected or deselected |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-menu--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-menu--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Menu)

## License

MIT © 3MO GmbH