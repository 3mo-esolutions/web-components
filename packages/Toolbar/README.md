# Toolbar

A web component for single-line toolbars that move the items that do not fit into an overflow menu.

[![npm](https://img.shields.io/npm/v/@3mo/toolbar?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/toolbar) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-toolbar--overview)

A single-line toolbar that moves the items that do not fit into an overflow menu.

## Installation

```sh
npm install @3mo/toolbar
```

```ts
import '@3mo/toolbar'
```

## Usage

```html
<mo-toolbar overflowIcon='more_vert' overflowPosition='end'>
	<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
	<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
	<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
	<mo-menu-item icon='format_bold'>Bold</mo-menu-item>
	<mo-menu-item icon='format_italic'>Italic</mo-menu-item>
	<mo-menu-item icon='format_underlined'>Underline</mo-menu-item>
	<mo-menu-item icon='insert_link'>Link</mo-menu-item>
	<mo-menu-item icon='image'>Image</mo-menu-item>
</mo-toolbar>
```

## Examples

- [Pinned Items](https://3mo-esolutions.github.io/web-components/?path=/story/layout-toolbar--pinned-items) — An item with `data-no-overflow` never moves into the menu: "Save" stays however narrow the toolbar gets.
- [Collapsed](https://3mo-esolutions.github.io/web-components/?path=/story/layout-toolbar--collapsed) — `collapsed` puts every item into the menu, leaving only its button.
- [Overflow Button](https://3mo-esolutions.github.io/web-components/?path=/story/layout-toolbar--overflow-button) — `overflowPosition='start'` puts the menu button before the items, and `overflowIcon` changes its icon.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-toolbar--parts) — The `pane` and `overflow-icon` parts can be styled from outside.
- [With Controller](https://3mo-esolutions.github.io/web-components/?path=/story/layout-toolbar--with-controller) — `ToolbarController` moves items between any pane slot and overflow slot of your own component; here two panes share one list.

## API

### `mo-toolbar`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `overflowIcon` | `overflowIcon` | `MaterialIcon` | `"more_vert"` | The icon of the overflow menu button. Defaults to `more_vert`. |
| `overflowPosition` | `overflowPosition` | `"start" \| "end"` | `"end"` | Whether the overflow menu button comes at the `start` or the `end` (default). |
| `collapsed` | `collapsed` | `boolean` | `false` | Puts every item into the overflow menu. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The default slot containing toolbar pane items |

#### CSS parts

| Name | Description |
| --- | --- |
| `pane` | The toolbar pane |
| `overflow-icon` | The overflow icon |

### `mo-toolbar-pane`

The single-line pane a `ToolbarController` measures, clipping the items that do not fit.

Space its items with `gap`, as the measurements do not count margins.

#### Slots

| Name | Description |
| --- | --- |
| (default) | The toolbar items |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-toolbar--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-toolbar--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Toolbar)

## License

MIT © 3MO GmbH
