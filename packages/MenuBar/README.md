# Menu Bar

Web components for application menu bars, like File, Edit and View, with menubar keyboard and hover behavior.

[![npm](https://img.shields.io/npm/v/@3mo/menu-bar?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/menu-bar) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-menu-bar--overview)

The menus of an application along one bar, like File, Edit and View of a desktop program; navigation belongs in `mo-navigation`.

Give it an accessible name with `aria-label` or `aria-labelledby`.

## Installation

```sh
npm install @3mo/menu-bar
```

```ts
import '@3mo/menu-bar'
```

## Usage

```html
<mo-menu-bar aria-label='Editor'>
	<mo-menu-bar-item>
		File
		<mo-menu slot='menu'>
			<mo-menu-item icon='note_add'>New</mo-menu-item>
			<mo-menu-item icon='save'>Save</mo-menu-item>
			<mo-menu-item icon='print'>Print</mo-menu-item>
		</mo-menu>
	</mo-menu-bar-item>
	<mo-menu-bar-item>
		Edit
		<mo-menu slot='menu'>
			<mo-menu-item icon='undo'>Undo</mo-menu-item>
			<mo-menu-item icon='redo'>Redo</mo-menu-item>
		</mo-menu>
	</mo-menu-bar-item>
	<mo-menu-bar-item>
		Help
		<mo-menu slot='menu'>
			<mo-menu-item icon='help'>Documentation</mo-menu-item>
			<mo-menu-item icon='info'>About</mo-menu-item>
		</mo-menu>
	</mo-menu-bar-item>
</mo-menu-bar>
```

## Examples

- [Menu Content](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu-bar--menu-content) — The menus take what any `mo-menu` does: submenus, selectable items and separators.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu-bar--disabled) — A disabled item fades and does not open its menu.
- [Overflow](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu-bar--overflow) — Resize the container: menus that do not fit are hidden and skipped by the cursor, and `overflowChange` reports it.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu-bar--parts) — The `trigger` part of each item can be restyled from outside.
- [With Controller](https://3mo-esolutions.github.io/web-components/?path=/story/actions-menu-bar--with-controller) — `MenuBarController` applies the pattern to items of your own, here plain buttons rendered by a custom component.

## Accessibility

A `menubar` whose items are `none`, with the button of each a `menuitem` and each item's menu a [menu](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-menu-controller--overview). The bar is one tab stop.

| Key | Does |
| --- | --- |
| `ArrowRight` `ArrowLeft`, `Home` `End` | The next, previous, first or last item. |
| A letter | Typeahead by the items' labels. |
| `ArrowDown` `Enter` `Space` | Opens the item's menu on its first item; `ArrowUp` on its last. |
| `ArrowRight` `ArrowLeft` | While a menu is open: opens the neighbouring menu instead, as a pointer moving over the items does. |

Items that do not fit the bar are hidden and skipped; the bar reports them with `overflowChange`, so offer them another way. Name the bar with `aria-label`.

## API

### `mo-menu-bar`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `hasOverflow` |  | `boolean` |  | Whether some items do not fit. Those carry `data-overflowed` and are hidden. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `overflowChange` | `boolean` | Dispatched when `hasOverflow` changes. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The items, which are `mo-menu-bar-item`s. |

### `mo-menu-bar-item`

One menu of a `mo-menu-bar`: a trigger and the menu it opens, which is anchored to the trigger.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `label` |  | `string` |  | The trigger's text, matched by typeahead. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the menu can be opened. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The trigger's content, usually its label. |
| `menu` | The menu this item opens. |

#### CSS parts

| Name | Description |
| --- | --- |
| `trigger` | The button which opens the menu. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-menu-bar--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-menu-bar--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/MenuBar)

## License

MIT © 3MO GmbH
