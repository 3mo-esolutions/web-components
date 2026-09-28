# Select Field

Web components for select fields and their options, single or multiple, searchable or free-text, as an ARIA combobox.

[![npm](https://img.shields.io/npm/v/@3mo/select-field?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/select-field) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-select-field--overview)

A field that selects one or more of its options from a dropdown menu, which typing can search.

## Installation

```sh
npm install @3mo/select-field
```

```ts
import '@3mo/select-field'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-field-select label='Country' default='No selection'>
	<mo-option value='DE'>Germany</mo-option>
	<mo-option value='FR'>France</mo-option>
	<mo-option value='IT'>Italy</mo-option>
	<mo-option value='ES'>Spain</mo-option>
	<mo-option value='NL'>Netherlands</mo-option>
</mo-field-select>
```

## Examples

- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--value) — `value` selects the option with that value, and takes an array when the field is `multiple`.
- [Index And Data](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--index-and-data) — The same selection is also `index`, the option's position, and `data`, the object it carries.
- [Option Content](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--option-content) — An option holds any content, such as a flag, while the input shows its text.
- [Value Far Down The List](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--value-far-down-the-list) — Opening the menu scrolls to the selection far down the list, and ArrowDown steps on from it to Uruguay rather than from the top.
- [Default Option](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--default-option) — `default` adds a first item that clears the selection; with `reflectDefault` the input shows its text while nothing is selected.
- [Multiple](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--multiple) — `multiple` gives every option a checkbox and keeps the menu open while you pick; the input lists the selected options.
- [Searchable](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--searchable) — `searchable` filters the options by what you type, and says so when nothing matches.
- [Free Input](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--free-input) — `freeInput` keeps text no option matches.
- [Actions](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--actions) — A list item that is not an option is an action: the arrow keys reach it, and choosing it runs its click without selecting anything.
- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--states) — A disabled field ignores input, a readonly one shows its value without letting it change, and a dense one is shorter.
- [Subgrid Layout](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-select-field--subgrid-layout) — The `list` part laid out as a grid, with every option as a subgrid row, lines up flags, dialling codes and names; `inputText` is what the input shows.

## Accessibility

A [combobox](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-combobox--overview) over a listbox of its options: the input and the listbox are named after the `label`, and a `searchable` field adds `aria-autocomplete='list'`. Focus stays in the input while the keys move through the options.

## API

### `mo-field-select`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `default` | `default` | `string \| undefined` |  | The text of a first menu item that clears the selection. |
| `reflectDefault` | `reflectDefault` | `boolean` | `false` | Whether the input shows the `default` text while nothing is selected. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense. |
| `open` | `open` | `boolean` | `false` | Whether the menu is open. |
| `multiple` | `multiple` | `boolean` | `false` | Whether multiple options can be selected. |
| `searchable` | `searchable` | `boolean` | `false` | Whether typing filters the options. |
| `freeInput` | `freeInput` | `boolean` | `false` | Whether the user can input values that are not in the options. |
| `index` | `index` | `Index` |  | The selected index. |
| `data` | `data` | `Data<T>` |  | The selected data. |
| `menuAlignment` | `menuAlignment` | `PopoverAlignment \| undefined` |  | Menu popover alignment |
| `menuPlacement` | `menuPlacement` | `PopoverPlacement \| undefined` |  | Menu popover placement |
| `value` | `value` | `Value` |  | The selected value, or an array of them when `multiple`. |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | The selected value, or an array of them when `multiple`. |
| `input` | `T \| undefined` | The input's text, as typed or as it shows the selection. |
| `dataChange` | `Data<T>` | The selected option's data, or an array of them when `multiple`. |
| `indexChange` | `Index` | The selected option's position, or an array of them when `multiple`. |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The select options. |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `input` | The input element. |
| `dropDownIcon` | The dropdown icon. |
| `menu` | The popover holding the options. |
| `list` | The listbox of options. |
| `container` | Field's container |

### `mo-option`

An option of a select field, holding any content and selected by its value, its data or its position.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string \| undefined` |  | The value the field selects the option by. |
| `data` | `data` | `T \| undefined` |  | The data the option carries. |
| `index` | `index` | `number \| undefined` |  | The option's position among the field's items, which the field sets. |
| `multiple` | `multiple` | `boolean` | `false` | Whether the option shows a checkbox, which the field sets when `multiple`. |
| `inputText` | `inputText` | `string \| undefined` |  | The text the field's input shows for the option, in place of its content. |
| `selected` | `selected` | `boolean` | `false` | Whether the option is selected, which the field sets. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `true` | `true` | Whether the list item should prevent click on space |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-select-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-select-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/SelectField)

## License

MIT © 3MO GmbH