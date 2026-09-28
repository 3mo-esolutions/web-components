# Navigation

Web components for app shells whose navigation shows as a bar, a rail or a drawer, whichever fits the space.

[![npm](https://img.shields.io/npm/v/@3mo/navigation?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/navigation) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-navigation--overview)

The application's shell: a header, the page, and the navigations as a bar, a rail or a drawer, whichever fits.

## Installation

```sh
npm install @3mo/navigation
```

```ts
import '@3mo/navigation'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-navigation heading='Business Suite' .navigations=${navigations} .presentations=${presentations}>
	<mo-heading typography='heading3' style='padding: 2rem'>Dashboard</mo-heading>
</mo-navigation>
```

## Examples

- [Rail](https://3mo-esolutions.github.io/web-components/?path=/story/layout-navigation--rail) — With `rail` in the order, the rail takes over once the bar no longer fits, as long as the page keeps its room beside it.
- [Drawer](https://3mo-esolutions.github.io/web-components/?path=/story/layout-navigation--drawer) — The drawer holds every navigation as one tree, over the page; the menu button in the header opens it.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/layout-navigation--slots) — The `logo` slot leads the header, or tops the rail, and the `end` slot closes the header.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-navigation--custom-properties) — The rail's sizes and the room the page keeps beside it are custom properties, which move the point where the rail gives way to the drawer.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-navigation--parts) — The `app-bar` and `content` parts can be styled from outside.

## API

### `mo-navigation`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `navigations` | `navigations` | `INavigation[]` | `"new Array<INavigation>()"` | The navigations to present. |
| `presentations` | `presentations` | `NavigationPresentation[]` |  | The presentations to choose from, most preferred first. Defaults to `bar` then `drawer`. |
| `presentation` | `presentation` | `NavigationPresentation` | `"bar"` | The presentation being shown. Derived, and reflected for styling. |
| `heading` | `heading` | `string \| HTMLTemplateResult \| undefined` |  | The application's heading, shown in the header and above the drawer's navigations. |
| `drawerOpen` | `drawerOpen` | `boolean` | `false` | Whether the drawer is open. Only of consequence while the drawer is the presentation. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The page. |
| `logo` | Placed at the start of the header, and at the top of the rail. |
| `end` | Placed at the end of the header. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-navigation-min-content-size` | How much room the page keeps beside the rail. Defaults to `32rem`, which puts the rail's threshold at Material's medium window. |
| `--mo-navigation-rail-size` | How wide the rail's strip is. Defaults to `5.5rem`. |
| `--mo-navigation-rail-panel-size` | How wide the rail's panel is. Defaults to `17rem`. |

#### CSS parts

| Name | Description |
| --- | --- |
| `app-bar` | The header above the page. |
| `content` | What the page is placed in. |

### `mo-navigation-bar`

The navigations as a horizontal row, each group opening its destinations as a dropdown.

It reports through `hasOverflow` whether its navigations still fit, which is what an orchestrating
`mo-navigation` decides by whether the bar is the presentation it can afford. The verdict is measured a
frame after the layout that changed it, so it is announced rather than left to be read: whoever decides
by it would otherwise read the previous one and never be told that it has moved on.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `navigations` | `navigations` | `INavigation[]` | `"new Array<INavigation>()"` | The navigations to present. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `invoke` | `INavigation` | Dispatched with the navigation which was invoked. |
| `overflowChange` | `boolean` | Dispatched with the new verdict whenever whether the navigations fit changes. |

### `mo-navigation-bar-item`

A navigation of a navigation bar: a destination, or a group opening its destinations as a dropdown.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `navigation` | `navigation` | `INavigation` |  | The navigation this item stands for. |
| `open` | `open` | `boolean` | `false` | Whether the group's dropdown is open. |
| `current` | `data-current` | `boolean` | `false` | Whether this navigation, or one nested in it, is the page being shown. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `invoke` | `INavigation` | Dispatched with the destination which was invoked. |

### `mo-navigation-drawer`

Every navigation as a tree, in a modal drawer over the page.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `navigations` | `navigations` | `INavigation[]` | `"new Array<INavigation>()"` | The navigations to present. |
| `open` | `open` | `boolean` | `false` | Whether the drawer is open. |
| `heading` | `heading` | `string \| HTMLTemplateResult \| undefined` |  | Placed above the tree. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched with the new state whenever the drawer opens or closes. |
| `invoke` |  | Dispatched with the destination which was invoked, on its way up from the tree. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-navigation-drawer-width` | How wide the drawer is. Defaults to `292px`. |

### `mo-navigation-rail`

The navigations as a vertical strip at the leading edge, each one an icon with its label beneath it.

A group's destinations are shown in a panel beside the strip: docked next to the page while there is
room for both, and overlaid over the page while there is not.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `shownNavigation` |  | `INavigation \| undefined` |  | The navigation whose destinations the panel shows. |
| `navigations` | `navigations` | `INavigation[]` | `"new Array<INavigation>()"` | The navigations to present. |
| `docked` | `docked` | `boolean` | `false` | Whether the panel stands beside the page rather than over it. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `invoke` | `INavigation` | Dispatched with the destination which was invoked. |

#### Slots

| Name | Description |
| --- | --- |
| `header` | Placed above the navigations, e.g. a logo or a button which creates something. |
| `footer` | Placed below the navigations. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-navigation-rail-size` | How wide the strip is. Defaults to `5.5rem`. |
| `--mo-navigation-rail-panel-size` | How wide the panel is. Defaults to `17rem`. |

#### CSS parts

| Name | Description |
| --- | --- |
| `strip` | The strip of navigations. |
| `panel` | The panel holding the destinations of the navigation being shown. |

### `mo-navigation-rail-item`

A navigation of a navigation rail: an icon with its label beneath it.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `navigation` | `navigation` | `INavigation` |  | The navigation this item stands for. |
| `current` | `data-current` | `boolean` | `false` | Whether this navigation, or one nested in it, is the page being shown. |
| `selected` | `selected` | `boolean` | `false` | Whether the rail is showing this navigation's destinations. |

#### CSS parts

| Name | Description |
| --- | --- |
| `indicator` | The shape behind the icon, which marks the navigation the page belongs to. |
| `label` | The label beneath the icon. |

### `mo-navigation-tree`

The navigations as a tree of rows: a group is a row which opens, a destination is a row which navigates.
The row of the page being shown is revealed, so that a deep destination is on screen right away.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `navigations` | `navigations` | `INavigation[]` | `"new Array<INavigation>()"` | The navigations to present. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `invoke` | `INavigation` | Dispatched with the destination which was invoked. |

#### CSS parts

| Name | Description |
| --- | --- |
| `tree` | The tree holding the rows. |
| `item` | Every row of the tree. |

### `mo-navigation-tree-item`

A row of a navigation tree: a destination, or a group of them which opens.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `current` | `data-current` | `boolean` | `false` | Whether this row, or a row nested in it, is the page being shown. |
| `items` |  | `TreeItem[]` |  | The nested items. |
| `value` | `value` | `string \| undefined` |  | What the tree reports this item as. An item without one is not in the tree's `value`. |
| `open` | `open` | `boolean` | `false` | Whether the nested items are shown. |
| `selected` | `selected` | `boolean` | `false` | Whether the item starts out selected. |
| `disabled` | `disabled` | `boolean` | `false` | Neither navigable nor selectable. |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | An icon before the content. |
|  | `data-separator` |  |  | Whether a divider parts this row from the one before it. |

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

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-navigation--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-navigation--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Navigation)

## License

MIT © 3MO GmbH