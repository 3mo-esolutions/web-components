# List

Web components for lists with selectable, checkbox, radio and switch items, plus ARIA listbox and combobox controllers.

[![npm](https://img.shields.io/npm/v/@3mo/list?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/list) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-list--overview)

A list of items, such as `mo-list-item`s and the ones with a checkbox, switch or radio button.

## Installation

```sh
npm install @3mo/list
```

```ts
import '@3mo/list'
```

## Usage

```html
<mo-list>
	<mo-list-item icon='inbox'>Inbox</mo-list-item>
	<mo-list-item icon='drafts'>Drafts</mo-list-item>
	<mo-list-item icon='send'>Sent</mo-list-item>
	<mo-list-item icon='delete'>Trash</mo-list-item>
</mo-list>
```

## Examples

- [Content](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--content) — An item holds any content after its `icon`, such as a shortcut at its end, and an element with `role='separator'` divides the groups.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--disabled) — A `disabled` item fades and ignores presses; an element inside it can still take them with `pointer-events: auto`.
- [Subgrid Layout](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--subgrid-layout) — A list laid out as a grid whose items take its columns through `subgrid` lines up the icons, labels and shortcuts of all items.
- [Checkbox Items](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--checkbox-items) — `mo-checkbox-list-item` makes the whole item the label of its checkbox.
- [Switch Items](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--switch-items) — `mo-switch-list-item` does the same for a switch.
- [Radio Items](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--radio-items) — `mo-radio-list-item` does the same for a radio button.
- [Selection Control Alignment](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--selection-control-alignment) — `selectionControlAlignment='start'` places the control before the content instead of at its end.
- [Selectable Items](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--selectable-items) — A `toggleable` selectable item is selected and deselected by a press, and shows its state by its background.
- [Collapsible Items](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--collapsible-items) — `mo-collapsible-list-item` opens its `details` below the item it holds, to any depth.
- [Selectable List](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--selectable-list) — `mo-selectable-list` keeps one selection over all its selectable items, whatever their control, as their indices in `value`; arrow keys move between them.
- [Selectable Collapsible Items](https://3mo-esolutions.github.io/web-components/?path=/story/data-list--selectable-collapsible-items) — Selectable items inside collapsible ones join the list's selection too; here `:has()` outlines the group that holds it.

### Combobox

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-combobox--default) — ↓ or ↑ opens the list onto the chosen country and Esc closes it; each new filter makes its first match active, so Enter takes it.
- [Search In Popup](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-combobox--search-in-popup) — A button opens a popup with its own search box, which is the combobox.

### Listbox

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-listbox--default) — Tab in, then the arrows, Home, End and typing a name move; Space or Enter selects.
- [Selection Follows Focus](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-listbox--selection-follows-focus) — `selectionFollowsFocus` selects whichever option the arrows reach, as a single-select listbox of few options may.
- [Horizontal](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-listbox--horizontal) — `orientation: 'horizontal'` moves with ← and →, which follow the writing direction.
- [Multiple Selection](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-listbox--multiple-selection) — Space or a click toggles one option, Shift+arrow and Shift+Space extend a range, Ctrl+Shift+Home or End select to either end, and Ctrl+A selects all or none.
- [Filter As You Type](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-listbox--filter-as-you-type) — With `combobox`, focus stays in the input and the active option is announced on it by element reference; Home, End, ← and → stay the input's.
- [Grouped](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-listbox--grouped) — Options in labelled groups: the arrows run straight on from one group into the next, while a screen reader counts within each.

## Accessibility

### `mo-list`

A `list` of `listitem`s: every item is a tab stop, and `Enter` and `Space` click it. For a choice among the items use `mo-selectable-list`, a [listbox](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-listbox--overview).
`ArrowRight` opens a `mo-collapsible-list-item` and `ArrowLeft` closes it. It does not announce whether it is open yet, and the two keys do not swap in a right-to-left language.

### `ListboxController`

The list is a `listbox`, with `aria-multiselectable` while multiple and `aria-orientation='horizontal'` when horizontal.
Each option is an `option` with `aria-selected`, and `aria-disabled` while disabled.
Focus roves: Tab lands on the first selected option, else on the first one. The arrows move without selecting,
unless `selectionFollowsFocus` selects as they move in single selection.

| Key | Does |
| --- | --- |
| `ArrowDown` `ArrowUp` | The next or previous option; `ArrowRight` and `ArrowLeft` when horizontal. |
| `Home` `End`, `PageUp` `PageDown` | The first or last option, or a page further. |
| A letter | Typeahead. |
| `Space` `Enter` | Selects the option, as a click does; toggles it while multiple. |
| `Shift` + an arrow | Multiple: moves and extends the selection from where it started. |
| `Ctrl` `Shift` `Home` / `End` | Multiple: selects from the option to the first or last one. |
| `Ctrl` `A` | Multiple: selects all, or none while all are selected. |

Name the list with `aria-label` or `aria-labelledby`.

### `ComboboxController`

The input is a `combobox` with `aria-expanded` and `aria-controls` pointing at the listbox, whose options follow the [listbox](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-listbox--overview) pattern.
Focus stays in the input: the active option is named by `aria-activedescendant`, set as an element reference so it reaches options in another shadow root, and gets `data-keyboard-focus` so it can show a focus ring.

| Key | Does |
| --- | --- |
| `ArrowDown` `PageDown` | Closed: opens on the selected option, else on the first. |
| `ArrowUp` `PageUp` | Closed: opens on the selected option, else on the last. |
| `Home` `End`, `Enter` `Space` | Closed, where the input takes no typing: opens, on the first or last option for `Home` and `End`, on the selected one for `Enter` and `Space`. |
| `ArrowDown` `ArrowUp` | Open: the next or previous option. |
| `Home` `End` | Open: the first or last option; in an input that takes typing they move the caret instead. |
| A letter | Typeahead, or the typing that filters the options. |
| `Enter` | Chooses the active option and closes; `Space` too, where the input takes no typing. |
| `Escape` `Tab` | Closes; `Tab` moves focus on as well. |

Name the input and the listbox, for example after a visible label.

## API

### `mo-list`

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `itemsChange` | `HTMLElement[]` | Dispatched when the list items change |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The list items. |

### `mo-checkbox-list-item`

A list item with a checkbox, which a press anywhere on the item toggles.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `selectionControlAlignment` | `selectionControlAlignment` | `"start" \| "end"` | `"end"` | The alignment of the checkbox relative to the list item content |
| `selected` | `selected` | `CheckboxSelection` | `false` | The value of the checkbox |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |
|  | `indeterminate` |  |  | Whether the checkbox is indeterminate |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` |  | Dispatched when the checkbox value changes |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-collapsible-list-item`

A list item that opens into the nested items below it.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the list item is open |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The parent list item |
| `details` | The nested list items |

#### CSS parts

| Name | Description |
| --- | --- |
| `summary` | The summary element hosting the parent list item |
| `details` | The details element hosting the nested list items |
| `expand-collapse-icon-button` | The expand/collapse icon button |

### `mo-list-item`

An item of a list, with an optional icon before its content.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-list-item-ripple`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Whether the ripple is disabled |

### `mo-navigation-list-item`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-radio-list-item`

A list item with a radio button, which a press anywhere on the item selects.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `name` | `name` | `string \| undefined` |  | The name of the radio |
| `selectionControlAlignment` | `selectionControlAlignment` | `"start" \| "end"` | `"end"` | The alignment of the radio relative to the list item content |
| `selected` | `selected` | `boolean` | `false` | Whether the radio is selected |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` |  | Dispatched when the radio value changes |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-selectable-list`

A list that keeps one selection over its selectable items, whichever their control, by their indices.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `selectability` | `selectability` | `Selectability` | `"single"` | The selectability of the list |
| `value` | `value` | `number[]` | `"new Array<number>()"` | The selected list items' indices |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `number[]` | Dispatched when the selected list items change |
| `itemsChange` | `HTMLElement[]` | Dispatched when the list items change |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for list items |

### `mo-selectable-list-item`

A list item that a press selects, shown by its background.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `toggleable` | `toggleable` | `boolean` | `false` | Whether the list item selection can be toggled on and off |
| `selected` | `selected` | `boolean` | `false` | Whether the list item is selected |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` |  | Dispatched when the list item is selected or deselected |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-switch-list-item`

A list item with a switch, which a press anywhere on the item toggles.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `selectionControlAlignment` | `selectionControlAlignment` | `"start" \| "end"` | `"end"` | The alignment of the switch relative to the list item content |
| `selected` | `selected` | `boolean` | `false` | Whether the switch is selected |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` |  | Dispatched when the switch value changes |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-list--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-list--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/List)

## License

MIT © 3MO GmbH
