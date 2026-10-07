# Popover

Web components for popovers anchored to an element or a point, opened by click, context menu or hover through a directive.

[![npm](https://img.shields.io/npm/v/@3mo/popover?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/popover) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-popover--overview)

A floating surface anchored to an element, shown above everything else.

## Installation

```sh
npm install @3mo/popover
```

```ts
import '@3mo/popover'
```

## Usage

```html
<mo-popover-container placement='block-end' alignment='start'>
	<mo-button type='outlined'>Delivery</mo-button>
	<mo-popover slot='popover'>
		<mo-card heading='Delivery'>Two to four working days within the EU.</mo-card>
	</mo-popover>
</mo-popover-container>
```

## Examples

- [Placements](https://3mo-esolutions.github.io/web-components/?path=/story/layout-popover--placements) — `placement` picks the side of the anchor and `alignment` how the popover lines up along it; a popover that does not fit flips to the opposite side.
- [Target](https://3mo-esolutions.github.io/web-components/?path=/story/layout-popover--target) — `target` names the element within the anchor that opens the popover: only the icon button does here.
- [Manual](https://3mo-esolutions.github.io/web-components/?path=/story/layout-popover--manual) — `mode='manual'` leaves opening and closing to `open`: neither a click outside nor Escape closes it.
- [Focus](https://3mo-esolutions.github.io/web-components/?path=/story/layout-popover--focus) — The element marked `autofocus` takes the focus as the popover opens, and the focus returns to the anchor as it closes.
- [Lazy](https://3mo-esolutions.github.io/web-components/?path=/story/layout-popover--lazy) — `popover()` with a `trigger` renders nothing until the anchor is first used, so a hundred chips cost no popovers.
- [Platform Invokers](https://3mo-esolutions.github.io/web-components/?path=/story/layout-popover--platform-invokers) — A popover is a native popover element, so the platform's `popovertarget` and `commandfor` buttons toggle it and anchor it to themselves.

## API

### `mo-popover`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `shouldOpen` | `shouldOpen` | `((e: Event) => boolean) \| undefined` |  |  |
| `coordinates` | `coordinates` | `PopoverCoordinates \| undefined` |  | A point `[x, y]` in the viewport to open at instead of the anchor. |
| `anchor` | `anchor` | `HTMLElement \| undefined` |  | The element the popover is anchored to and opened by. |
| `target` | `target` | `string \| undefined` |  | The id of the element within the anchor whose clicks open the popover. |
| `placement` | `placement` | `PopoverPlacement` | `"block-end"` | The side of the anchor: `block-end` (default), `block-start`, `inline-start` or `inline-end`. |
| `alignment` | `alignment` | `PopoverAlignment` | `"start"` | How the popover lines up along that side: `start` (default), `center` or `end`. |
| `offset` | `offset` | `number \| undefined` |  | The distance from the anchor in pixels, in browsers without CSS anchor positioning. |
| `open` | `open` | `boolean` | `false` | Whether the popover is open. |
| `mode` | `mode` | `PopoverMode` | `"auto"` | `auto` (default) closes on a click outside or Escape and closes other auto popovers; `manual` opens and closes only through `open`; `hint` closes like `auto` but leaves auto popovers open. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched when the popover is opened or closed. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for popover content |

### `mo-popover-container`

Anchors the popover in its `popover` slot to the element in its default slot.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `alignment` | `alignment` | `PopoverAlignment` | `"start"` | Passed on to the popover. |
| `placement` | `placement` | `PopoverPlacement` | `"block-end"` | Passed on to the popover. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content to be anchored |
| `popover` | The popover to be anchored |

### `mo-popover-host`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `template` |  | `HTMLTemplateResult` |  | The template rendered into renderRoot. Invoked on each update to perform rendering tasks. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-popover--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-popover--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Popover)

## License

MIT © 3MO GmbH
