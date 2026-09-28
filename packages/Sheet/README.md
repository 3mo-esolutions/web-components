# Sheet

A web component for modal sheets anchored to any screen edge with swipe-to-dismiss, built on the native dialog element.

[![npm](https://img.shields.io/npm/v/@3mo/sheet?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/sheet) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-sheet--overview)

A modal panel anchored to an edge of the viewport, closed by Escape, the backdrop, its handle or a swipe.

## Installation

```sh
npm install @3mo/sheet
```

```ts
import '@3mo/sheet'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-button type='outlined' startIcon='share' @click=${() => setOpen(true)}>Share</mo-button>
<mo-sheet placement='block-end' label='Share' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
	<mo-list style='padding-block: 8px'>
		<mo-list-item icon='insert_link'>Copy link</mo-list-item>
		<mo-list-item icon='mail'>Send by email</mo-list-item>
		<mo-list-item icon='download'>Download</mo-list-item>
	</mo-list>
</mo-sheet>
```

## Examples

- [Placements](https://3mo-esolutions.github.io/web-components/?path=/story/layout-sheet--placements) — A sheet comes in from the edge it is anchored to.
- [Scrollable](https://3mo-esolutions.github.io/web-components/?path=/story/layout-sheet--scrollable) — Content taller than the sheet scrolls inside it, while the handle stays put.
- [Prevented Close](https://3mo-esolutions.github.io/web-components/?path=/story/layout-sheet--prevented-close) — Cancelling `requestClose` keeps the sheet open.
- [Nested Popover](https://3mo-esolutions.github.io/web-components/?path=/story/layout-sheet--nested-popover) — Menus and popovers opened from the sheet render above it, and the field marked `autofocus` takes the focus as it opens.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-sheet--custom-properties) — `--mo-sheet-size` sets the width of a side sheet, and the corners, the backdrop and the motion have custom properties too.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-sheet--parts) — The `panel`, `handle` and `content` parts can be styled from outside.

## Accessibility

A native modal `dialog`, so the page behind it is inert. It is named by `label`, the element with `autofocus` inside takes focus as it opens, and its handle is a button named "Close". `Escape` fires the cancelable `requestClose` and closes.

## API

### `mo-sheet`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the sheet is open. |
| `placement` | `placement` | `SheetPlacement` | `"block-end"` | The edge the sheet is anchored to: `block-end` (default), `block-start`, `inline-start` or `inline-end`. |
| `label` | `label` | `string \| undefined` |  | The accessible name of the sheet. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched with the new state whenever the sheet opens or closes. |
| `requestClose` |  | Dispatched with the source before the sheet closes itself. Cancelable to keep the sheet open. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Content of the sheet. |
| `handle` | The grabber handle, replacing the default one. Only rendered for block placements. |
| `top-layer` | Hosts elements which must stay interactive while the rest of the page is made inert by the sheet. |

#### CSS custom properties

| Name | Description |
| --- | --- |
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

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-sheet--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-sheet--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Sheet)

## License

MIT © 3MO GmbH