# Loading Button

A web component for buttons that show a spinner by themselves while their click handler's promise runs.

[![npm](https://img.shields.io/npm/v/@3mo/loading-button?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/loading-button) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-loading-button--overview)

A `mo-button` that shows a progress while the promise returned by its `click` handler is pending.

## Installation

```sh
npm install @3mo/loading-button
```

```ts
import '@3mo/loading-button'
```

## Usage

```html
<mo-loading-button type='outlined' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Save</mo-loading-button>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/actions-loading-button--types) — A `click` handler that returns a promise keeps the button loading until it settles.
- [Loading](https://3mo-esolutions.github.io/web-components/?path=/story/actions-loading-button--loading) — While loading, the progress covers the label, or takes the place of the start icon when there is one.
- [Icons](https://3mo-esolutions.github.io/web-components/?path=/story/actions-loading-button--icons) — Icons work as on `mo-button`.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/actions-loading-button--slots) — The label and the `start` and `end` slots take any content; the progress keeps to the size of the button.
- [Manual Loading](https://3mo-esolutions.github.io/web-components/?path=/story/actions-loading-button--manual-loading) — `preventClickEventInference` ignores what the handlers return, so `loading` is yours to set.
- [Nested Action](https://3mo-esolutions.github.io/web-components/?path=/story/actions-loading-button--nested-action) — An interactive element in a slot handles its own presses; stopping their propagation keeps the button from loading.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/actions-loading-button--custom-properties) — The custom properties of `mo-button` apply, and the corner radius is the host's own `border-radius`.

## API

### `mo-loading-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `loading` | `loading` | `boolean` | `false` | Shows the progress and ignores presses. |
| `preventClickEventInference` | `preventClickEventInference` | `boolean` | `false` | Ignores the promises returned by `click` handlers, leaving `loading` to the consumer. |
| `type` | `type` | `ButtonType` | `"text"` | The emphasis, from `text` (lowest) to `filled` (highest). |
| `disabled` | `disabled` | `boolean` | `false` | Whether the button ignores presses. |
| `startIcon` | `startIcon` | `MaterialIcon \| undefined` |  | A Material icon shown before the label. |
| `endIcon` | `endIcon` | `MaterialIcon \| undefined` |  | A Material icon shown after the label. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The label. It is truncated with an ellipsis when it does not fit. |
| `start` | Content before the label, in place of `startIcon`. |
| `end` | Content after the label, in place of `endIcon`. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-button-accent-color` | The container color of filled buttons, and the label and outline color of text and outlined ones. |
| `--mo-button-on-accent-color` | The label color of filled and tonal buttons. |
| `--mo-button-horizontal-padding` | The inline padding, 12px for text buttons and 16px for the others by default. |
| `--mo-button-disabled-background-color` | The container color of disabled filled buttons. |
| `--mo-button-disabled-color` | The label and outline color of disabled buttons. |

#### CSS parts

| Name | Description |
| --- | --- |
| `button` | The composed native button element. |
| `ripple` | The ripple element. |
| `focus-ring` | The focus ring element. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-loading-button--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-loading-button--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/LoadingButton)

## License

MIT © 3MO GmbH