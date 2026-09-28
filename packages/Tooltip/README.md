# Tooltip

A web component for plain or rich tooltips shown on hover and focus, attachable to any element through a directive.

[![npm](https://img.shields.io/npm/v/@3mo/tooltip?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/tooltip) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-tooltip--overview)

A short label, or richer content, shown next to an element while it is hovered or focused.

## Installation

```sh
npm install @3mo/tooltip
```

```ts
import '@3mo/tooltip'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-icon-button icon='skip_previous' ${tooltip('Previous')}></mo-icon-button>
<mo-icon-button icon='fast_rewind' ${tooltip('Rewind')}></mo-icon-button>
<mo-icon-button icon='play_arrow' ${tooltip('Play')}></mo-icon-button>
<mo-icon-button icon='fast_forward' ${tooltip('Forward')}></mo-icon-button>
<mo-icon-button icon='skip_next' ${tooltip('Next')}></mo-icon-button>
```

## Examples

- [Placement](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-tooltip--placement) — The second argument picks the side of the anchor; the sides are logical, so pick a right-to-left language in the toolbar to see inline start and end swap.
- [Rich](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-tooltip--rich) — A template in place of the text makes a rich tooltip, drawn on a surface rather than in the text color.
- [Interest For](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-tooltip--interest-for) — A native `interestfor` invoker can show a `mo-tooltip` by its id, leaving the timing - including `interest-delay` - to the browser.

## Accessibility

A tooltip of plain text becomes its anchor's `aria-label`, replacing the anchor's own name; a tooltip with elements inside sets nothing.

## API

### `mo-tooltip`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `anchorElement` |  | `HTMLElement \| undefined` |  | The element the tooltip is tethered to: its assigned anchor, or the native invoker showing interest. |
| `placement` | `placement` | `PopoverPlacement \| undefined` |  | The side of the anchor the tooltip shows on: `block-start`, `block-end`, `inline-start` or `inline-end`. |
| `anchor` | `anchor` | `HTMLElement \| undefined` |  | The element the tooltip is anchored to, set as a property. |
| `rich` | `rich` | `boolean` | `false` | Set by the tooltip itself when its content holds elements, which gives it a surface that can be interacted with. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched when the tooltip shows or hides. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The text of the tooltip, or rich content. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-tooltip-font-size` | The font size of the tooltip. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-tooltip--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-tooltip--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Tooltip)

## License

MIT © 3MO GmbH