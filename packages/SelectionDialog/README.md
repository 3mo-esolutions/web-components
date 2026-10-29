# Selection Dialog

A dialog for picking one or several entries from a data grid.

[![npm](https://img.shields.io/npm/v/@3mo/selection-dialog?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/selection-dialog)

A dialog for picking an entry, or several with `multipleSelection`, from the data grid of its `dataGridTemplate`.
A click selects a row; the primary button, or the first item of a row's context menu, confirms with the selected entries.

## Installation

```sh
npm install @3mo/selection-dialog
```

```ts
import '@3mo/selection-dialog'
```

## Usage

```html
<mo-button type='outlined' @click=${() => new SelectionDialog<Person>({ data: Person, dataGridTemplate }).confirm()}>
	Select a person
</mo-button>
```

## Examples

- [Multiple Selection](https://3mo-esolutions.github.io/web-components/?path=/story/data-selection-dialog--multiple-selection) — `multipleSelection` confirms with every selected entry.

## Links

- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/SelectionDialog)

## License

MIT © 3MO GmbH
