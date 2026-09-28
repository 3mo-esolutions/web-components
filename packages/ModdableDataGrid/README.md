# Moddable Data Grid

A web component for fetchable data grids with user-saved views of columns, sorting and filters, stored in IndexedDB.

[![npm](https://img.shields.io/npm/v/@3mo/moddable-data-grid?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/moddable-data-grid) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-moddable-data-grid--overview)

## Installation

```sh
npm install @3mo/moddable-data-grid
```

```ts
import '@3mo/moddable-data-grid'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-moddable-data-grid--default) — Pick a view in the bar above the grid and change its filters, sorting or columns: its chip then offers to save or discard the changes, and the add button saves them as a new view.
- [No Views](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-moddable-data-grid--no-views) — A `modesAdapter` keeps the views, here in memory and none to begin with: the bar stays hidden and the add button sits among the toolbar's actions until the first view is saved.
- [Archived Views](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-moddable-data-grid--archived-views) — Archived views leave the bar for the archive menu at its end, where they are applied, pinned back, edited or deleted.
- [Indexed Db](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-moddable-data-grid--indexed-db) — Without a `modesAdapter`, the views are kept in IndexedDB under the grid's tag, so they survive a reload.

## API

### `mo-moddable-data-grid-chip`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `dataGrid` | `dataGrid` | `ModdableDataGrid<TData, TParameters, undefined>` |  |
| `mode` | `mode` | `ModdableDataGridMode<TData, TParameters>` |  |
| `selected` | `selected` | `boolean` | `false` |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-moddable-data-grid--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-moddable-data-grid--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ModdableDataGrid)

## License

MIT © 3MO GmbH