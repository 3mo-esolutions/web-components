# Drawer

A web component for modal navigation drawers that slide in from a side edge and close on Escape, a backdrop click or a swipe.

[![npm](https://img.shields.io/npm/v/@3mo/drawer?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/drawer) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-drawer--overview)

A navigation panel that comes in from the side: a sheet anchored to an inline edge.

## Installation

```sh
npm install @3mo/drawer
```

```ts
import '@3mo/drawer'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-icon-button icon='menu' @click=${() => setOpen(true)}></mo-icon-button>
<mo-drawer label='Navigation' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
	<mo-list style='padding-block: 8px'>
		<mo-list-item icon='dashboard'>Dashboard</mo-list-item>
		<mo-list-item icon='receipt_long'>Orders</mo-list-item>
		<mo-list-item icon='group'>Customers</mo-list-item>
		<mo-list-item icon='settings'>Settings</mo-list-item>
	</mo-list>
</mo-drawer>
```

## Examples

- [Placement](https://3mo-esolutions.github.io/web-components/?path=/story/layout-drawer--placement) — `placement='inline-end'` brings the drawer in from the other side, which follows the writing direction.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-drawer--custom-properties) — `--mo-drawer-width` sets the width, 256px by default.

## Accessibility

A native modal `dialog`, so the page behind it is inert. It is named by `label`, the element with `autofocus` inside takes focus as it opens, and `Escape` fires the cancelable `requestClose` and closes.

## API

### `mo-drawer`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the sheet is open. |
| `placement` | `placement` | `SheetPlacement` | `"inline-start"` | The edge the drawer is anchored to. Defaults to `inline-start`. |
| `label` | `label` | `string \| undefined` |  | The accessible name of the sheet. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched with the new state whenever the drawer opens or closes. |
| `requestClose` |  | Dispatched with the source before the drawer closes itself. Cancelable to keep it open. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Content of the drawer. |
| `handle` | The grabber handle, replacing the default one. Only rendered for block placements. |
| `top-layer` | Hosts elements which must stay interactive while the rest of the page is made inert by the sheet. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-drawer-width` | The width of the drawer. Defaults to `256px`. |
| `--mo-sheet-size` | The panel's size on its anchored axis: the maximum height for block placements, the width for inline placements. |
| `--mo-sheet-scrim` | The backdrop color. Defaults to the theme's scrim color. |
| `--mo-sheet-border-radius` | The corner radius of the panel's free edges. |
| `--mo-sheet-duration` | How long the sheet takes to come and go. Defaults to `250ms`. |
| `--mo-sheet-easing` | The easing of that motion. Defaults to Material's emphasized decelerate. |

#### CSS parts

| Name | Description |
| --- | --- |
| `dialog` | The native dialog element, filling the viewport. Its `::backdrop` carries the scrim. |
| `panel` | The visible sheet surface. |
| `handle` | The default grabber handle. |
| `content` | The scrollable wrapper around the default slot. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-drawer--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-drawer--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Drawer)

## License

MIT © 3MO GmbH