# Command Palette

A web component for a Ctrl+K command palette that searches registered data sources and runs the chosen command.

[![npm](https://img.shields.io/npm/v/@3mo/command-palette?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/command-palette) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-command-palette--overview)

A search across every registered data source, opened with Ctrl/⌘+P or Ctrl/⌘+K, whose results are commands.

## Installation

```sh
npm install @3mo/command-palette
```

```ts
import '@3mo/command-palette'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/actions-command-palette--default)
- [On Colored Bars](https://3mo-esolutions.github.io/web-components/?path=/story/actions-command-palette--on-colored-bars) — The button takes its colors from the inherited `color`, so it fits an accent app bar as well as a plain one.
- [Opened Programmatically](https://3mo-esolutions.github.io/web-components/?path=/story/actions-command-palette--opened-programmatically) — `CommandPalette.open()` opens the palette from anywhere, such as a button of your own.

## Accessibility

`Ctrl` or `⌘` with `K` or `P` opens it with the first result active. The arrows move through the results, `Enter` runs one, `Escape` closes, and `Tab` switches between the data sources rather than leaving.
The palette is a popover without a `dialog` role or a name yet.

## API

### `mo-command-palette-button`

A search button that opens the command palette and shows its shortcut on wide screens.

### `mo-command-palette-search-field`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `fetching` | `fetching` | `boolean` | `false` |  |
| `minLength` | `minLength` | `number \| undefined` |  | The fewest characters a valid value has |
| `maxLength` | `maxLength` | `number \| undefined` |  | The most characters the field takes, counted down at the end |
| `pattern` | `pattern` | `string \| undefined` |  | A regular expression the value has to match, as on a native input |
| `autoComplete` | `autoComplete` | `FieldTextAutoComplete \| undefined` |  | What the browser may fill in, as the native `autocomplete` attribute |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `string \| undefined` |  | The text |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `input` | The input element. |
| `container` | Field's container |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-command-palette--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-command-palette--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/CommandPalette)

## License

MIT © 3MO GmbH