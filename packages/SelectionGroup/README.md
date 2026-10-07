# Selection Group

A web component for giving any children one selection, one tab stop and the matching ARIA pattern, plus its controller.

[![npm](https://img.shields.io/npm/v/@3mo/selection-group?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/selection-group) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-selection-group--overview)

A set of children sharing one selection, one tab stop and one `value` — a question and its answers.
Give it an accessible name with `aria-label` or `aria-labelledby`.

## Installation

```sh
npm install @3mo/selection-group
```

```ts
import '@3mo/selection-group'
```

## Usage

```html
<mo-selection-group aria-label='Pickup location' selectability='single' value='berlin'>
	<mo-selectable-button type='outlined' value='berlin' startIcon='place'>Berlin</mo-selectable-button>
	<mo-selectable-button type='outlined' value='hamburg' startIcon='place'>Hamburg</mo-selectable-button>
	<mo-selectable-button type='outlined' value='munich' startIcon='place'>Munich</mo-selectable-button>
</mo-selection-group>
```

## Examples

- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-selection-group--value) — The group's `value` is its only state: nothing writes `selected` on an item.
- [Patterns](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-selection-group--patterns) — The ARIA pattern follows from the selectability.
- [Tiles](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-selection-group--tiles) — The group owns no layout beyond a wrapping row, so a grid of tiles is one `style` away.
- [Plain Elements](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-selection-group--plain-elements) — Any element child with a `value` is an item, even a plain `<button>`: the group stamps `data-selectability` on it to style by.

## Accessibility

The group takes its pattern from how it selects:

| Selectability | Group | Items |
| --- | --- | --- |
| `single` | `radiogroup` | `radio` with `aria-checked` |
| `multiple`, or `single` with `deselectable` | `group` | button with `aria-pressed` |
| none | `toolbar` | their own role |

Focus roves, and Tab lands on the selected item. Every arrow moves, wrapping, and `Home` and `End` go to the ends; the arrows never select, not even in a radio group, where the ARIA practices have them select. `Space` and `Enter` press the item. Name the group with `aria-label` or `aria-labelledby`.

## API

### `mo-selection-group`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `items` |  | `readonly SelectionGroupItem[]` |  | Every element child. Which of them a value addresses is decided by `valueOfItem`. |
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
| (default) | The items. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-selection-group--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-selection-group--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/SelectionGroup)

## License

MIT © 3MO GmbH
