# Chip

Web components for selectable, removable and linking chips, and chip sets that share one selection and one tab stop.

[![npm](https://img.shields.io/npm/v/@3mo/chip?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/chip) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-chip--overview)

A compact element for an attribute, a choice, an entry the user made or a contextual action, set in a `mo-chip-group`.

## Installation

```sh
npm install @3mo/chip
```

```ts
import '@3mo/chip'
```

## Usage

```html
<mo-chip>Chip</mo-chip>
```

## Examples

- [Readonly Tags](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--readonly-tags) — `readonly` renders a plain tag - not focusable, nothing to press - which is what a list of attributes should be.
- [With Leading Graphic](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--with-leading-graphic) — The `start` slot takes a leading icon, or an avatar the consumer rounds.
- [Filter Chips](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--filter-chips) — `selectability='multiple'` lets any number of chips be on, and the group's `value` is the array of their values.
- [Choice Chips](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--choice-chips) — `selectability='single'` makes the set a radio group, the alternative to a segmented button; `deselectable` lets the choice be taken back.
- [Input Chips](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--input-chips) — `removable` adds the remove button, and Backspace or Delete on a focused chip.
- [Selectable And Removable](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--selectable-and-removable) — Both at once: a chip selected by pressing it and removed by its own button.
- [With Trailing Actions](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--with-trailing-actions) — The `action` slot sits outside the chip's button, so pressing it does not press the chip.
- [Link](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--link) — With `href` the chip is a link that navigates instead of activating.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--disabled) — A disabled chip ignores presses, and so does its remove button.
- [Customized](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--customized) — Outlined by default and filled once selected; an outer rule changes the colors, the corner radius and the height.
- [Scrolling](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--scrolling) — A set that does not wrap belongs in a scroller.
- [Filter Bar](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--filter-bar) — A filter bar: a chip with the count, the applied filters as removable chips and the rest opening menus from a `mo-popover-container`.
- [Status Chips](https://3mo-esolutions.github.io/web-components/?path=/story/actions-chip--status-chips) — Statuses for a board or a grid column: `readonly`, colored by the same two properties and shrunk with a plain `min-height`.

## Accessibility

In a `mo-chip-group` the chips follow the pattern of a [selection group](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-selection-group--overview). On a `removable` chip, `Backspace` and `Delete` fire `requestRemove`, and `ArrowRight` and `ArrowLeft` move between the chip and its remove button, which is named "Remove" and the chip's label.

## API

### `mo-chip`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string \| undefined` |  | Identifies the chip within a `mo-chip-group`. |
| `selectable` | `selectable` | `boolean` | `false` | Makes the chip a toggle, announced as a pressed-state button. |
| `selected` | `selected` | `boolean` | `false` | Whether the chip is selected. Only meaningful while `selectable`. |
| `removable` | `removable` | `boolean` | `false` | Renders the remove button and enables removal via Backspace and Delete. |
| `readonly` | `readonly` | `boolean` | `false` | Renders a plain tag: not focusable, no state layer, no activation. |
| `disabled` | `disabled` | `boolean` | `false` | Disables the chip and its remove button. |
| `href` | `href` | `string \| undefined` |  | Renders the primary action as a link. |
| `target` | `target` | `"_blank" \| "_parent" \| "_self" \| "_top" \| undefined` |  | The link target, with `href`. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `requestSelect` |  | Dispatched with the state the chip would take, before it takes it. Cancelable: a group prevents it and rules instead. |
| `change` | `boolean` | Dispatched with the new state when the user toggles a selectable chip. |
| `requestRemove` |  | Dispatched before the chip is removed. Cancelable. The chip never removes itself. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The chip's label. |
| `start` | A graphic at the start, INSIDE the button. Replaced by the checkmark while selected. |
| `end` | A graphic at the end, INSIDE the button — the pair of `start`. Part of it, so the state layer covers it. |
| `action` | A control of your own — the one thing placed OUTSIDE the chip's button, so that pressing it is not pressing the chip. A graphic belongs in `start` or `end`. |

#### CSS parts

| Name | Description |
| --- | --- |
| `button` | The chip's button. |
| `label` | The label wrapper. |
| `remove` | The remove button. |

### `mo-chip-group`

A set of chips sharing one selection and one tab stop - Material's chip set.

Give it an accessible name with `aria-label` or `aria-labelledby`.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `chips` |  | `Chip[]` |  | Only chips, so that a chip wrapped in something of the consumer's own — a popover container — is that consumer's business rather than an item of the set. |
| `nowrap` | `nowrap` | `boolean` | `false` | Keeps the chips on one line, for a set that scrolls instead of wrapping. |
| `items` |  | `readonly Chip[]` |  | Every element child. Which of them a value addresses is decided by `valueOfItem`. |
| `value` | `value` | `SelectionGroupValue` |  | The selected items' values: the value itself in single selectability, an array of them in multiple. |
| `selectability` | `selectability` | `Selectability \| undefined` |  | `single`, `multiple`, or omitted for a row of commands. |
| `deselectable` | `deselectable` | `boolean` | `false` | Re-activating the selected item clears it. Also makes a single group a toggle group rather than a radio group. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `SelectionGroupValue` | Dispatched with the new value when the selection changes. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The chips. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-chip--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-chip--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Chip)

## License

MIT © 3MO GmbH