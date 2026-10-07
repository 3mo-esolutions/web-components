# Fetchable Select Field

A web component for select fields that fetch their options and search on the server as the user types.

[![npm](https://img.shields.io/npm/v/@3mo/fetchable-select-field?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/fetchable-select-field) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-fetchable-select-field--overview)

A select field whose options are fetched, and searched for on the server as the user types.

## Installation

```sh
npm install @3mo/fetchable-select-field
```

```ts
import '@3mo/fetchable-select-field'
```

## Usage

```html
<mo-field-fetchable-select label='Country' default='No selection'
	.fetch=${() => Promise.resolve([{ code: 'DE', label: 'Germany' }, { code: 'FR', label: 'France' }, { code: 'IT', label: 'Italy' }])}
	.optionTemplate=${(country: { code: string, label: string }) => html`<mo-option value=${country.code}>${country.label}</mo-option>`}
></mo-field-fetchable-select>
```

## Examples

- [Server Search](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-fetchable-select-field--server-search) — `searchParameters` turns what is typed into parameters for `fetch`, so the server searches, half a second after the last key.
- [Parameters](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-fetchable-select-field--parameters) — A change to `parameters` fetches again; each answer also fires `dataFetch`.
- [Value](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-fetchable-select-field--value) — `value` may be set before the options arrive; the field shows the selection as soon as they do.
- [Options Render Limit](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-fetchable-select-field--options-render-limit) — Only the first `optionsRenderLimit` fetched options render, 250 unless set; searching the server reaches the rest.
- [Default Option Template](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-fetchable-select-field--default-option-template) — Without `optionTemplate`, each fetched item becomes an option showing it as text, with its position as the value.

## API

### `mo-field-fetchable-select`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `optionsRenderLimit` | `optionsRenderLimit` | `number` | `"fetchedOptionsRenderLimit"` | The maximum number of fetched options to render. |
| `parameters` | `parameters` | `TDataFetcherParameters \| undefined` |  | The parameters to pass to the fetch function; a change fetches again. |
| `searchParameters` | `searchParameters` | `((keyword: string) => Partial<TDataFetcherParameters>) \| undefined` |  | A function turning the typed text into parameters for the fetch function when searching. |
| `fetch` | `fetch` | `((parameters: TDataFetcherParameters \| undefined) => Promise<T[]>) \| undefined` |  | The function to fetch the data. |
| `optionTemplate` | `optionTemplate` | `((data: T, index: number, array: T[]) => HTMLTemplateResult) \| undefined` |  | The template to render an option for each fetched item. |
| `default` | `default` | `string \| undefined` |  | The text of a first menu item that clears the selection. |
| `reflectDefault` | `reflectDefault` | `boolean` | `false` | Whether the input shows the `default` text while nothing is selected. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense. |
| `open` | `open` | `boolean` | `false` | Whether the menu is open. |
| `multiple` | `multiple` | `boolean` | `false` | Whether multiple options can be selected. |
| `searchable` | `searchable` | `boolean` | `false` | Whether typing filters the options to those holding every word typed, the first of which Enter takes. |
| `freeInput` | `freeInput` | `boolean` | `false` | Whether typed text is kept as the value, on Enter or as focus leaves, unless it is an option's text, which selects that option. |
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
| `dataFetch` | `T[]` | The fetched data. |
| `change` | `T \| undefined` | The selected value, or an array of them when `multiple`, or the text kept by `freeInput`. |
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

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-fetchable-select-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-fetchable-select-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FetchableSelectField)

## License

MIT © 3MO GmbH
