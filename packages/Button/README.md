# Button

Web components for buttons in the five Material 3 types, with start and end icons and a selectable toggle variant.

[![npm](https://img.shields.io/npm/v/@3mo/button?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/button) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-button--overview)

`mo-button` — A button that triggers an action, in one of the five Material 3 types.

`mo-selectable-button` — A `mo-button` that carries a selected state, a toggle on its own or an option of a `mo-selection-group`.

## Installation

```sh
npm install @3mo/button
```

```ts
import '@3mo/button'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering):

- `<mo-button>`: Renders with Lit SSR and hydrates.
- `<mo-selectable-button>`: Renders with Lit SSR and hydrates.

## Usage

```html
<mo-button type='outlined'>Save</mo-button>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--types) — From `text` for the least important action to `filled` for the one that completes a task.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--disabled) — A disabled button keeps its type, fades and ignores presses.
- [Icons](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--icons) — Icons take Material icon names and follow the writing direction - pick a right-to-left language in the toolbar to see them swap sides.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--slots) — The `start` and `end` slots take any content in place of the icons, and the label may hold more than text.
- [Overflow](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--overflow) — A label that does not fit is truncated with an ellipsis.
- [Nested Action](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--nested-action) — An interactive element in a slot handles its own presses; stopping their propagation keeps the button from firing too.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--custom-properties) — Colors and padding are custom properties; the corner radius is the host's own `border-radius`.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button--parts) — The `ripple` and `focus-ring` parts can be restyled or hidden from outside.

### Selectable Button

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/actions-selectable-button--default)
- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/actions-selectable-button--types) — Every type of `mo-button`, unselected and selected.
- [In A Selection Group](https://3mo-esolutions.github.io/web-components/?path=/story/actions-selectable-button--in-a-selection-group) — In a `mo-selection-group` the group owns the selection and the tab stop, and the buttons announce themselves as radios.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-selectable-button--disabled) — A disabled button keeps its selected state and ignores presses.
- [Customized](https://3mo-esolutions.github.io/web-components/?path=/story/actions-selectable-button--customized) — The selected look is plain CSS, so an outer `mo-selectable-button[selected]` rule replaces it.

## API

### `mo-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
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

### `mo-selectable-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string \| undefined` |  | Identifies the button within a `mo-selection-group`. |
| `selected` | `selected` | `boolean` | `false` | Whether the button is selected. |
| `type` | `type` | `ButtonType` | `"text"` | The emphasis, from `text` (lowest) to `filled` (highest). |
| `disabled` | `disabled` | `boolean` | `false` | Whether the button ignores presses. |
| `startIcon` | `startIcon` | `MaterialIcon \| undefined` |  | A Material icon shown before the label. |
| `endIcon` | `endIcon` | `MaterialIcon \| undefined` |  | A Material icon shown after the label. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `requestSelect` |  | Dispatched with the state the button would take, before it takes it. Cancelable: a group prevents it and rules instead. |
| `change` | `boolean` | Dispatched with the new state when the user toggles the button. |

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

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-button--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-button--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Button)

## License

MIT © 3MO GmbH