# Fetchable Data Grid

A web component for data grids that fetch their own rows, with server-side sorting, paging, infinite scrolling and auto-refetch.

[![npm](https://img.shields.io/npm/v/@3mo/fetchable-data-grid?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/fetchable-data-grid) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-fetchable-data-grid--overview)

A data grid that fetches its rows through a function of its parameters, a page at a time if the server paginates.

## Installation

```sh
npm install @3mo/fetchable-data-grid
```

```ts
import '@3mo/fetchable-data-grid'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-fetchable-data-grid style='height: 500px'
	.parameters=${{}}
	.fetch=${() => new Promise(resolve => setTimeout(() => resolve([
		{ name: 'Octavia Blake', age: 34, city: 'Berlin' },
		{ name: 'Clarke Griffin', age: 27, city: 'Hamburg' },
		{ name: 'Raven Reyes', age: 29, city: 'München' },
		{ name: 'Marcus Kane', age: 52, city: 'Frankfurt' },
	]), 1000))}
>
	<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
	<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
</mo-fetchable-data-grid>
```

## Examples

- [Parameters](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--parameters) — `fetch` receives the `parameters`, and new parameters fetch again - search for a name.
- [No Selection](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--no-selection) — Until `parameters` is set, the grid fetches nothing and asks for a filter selection, which the `error-no-selection` slot replaces.
- [Pagination](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--pagination) — `paginationParameters` turns a page into parameters, and `fetch` returns that page with the `dataLength` of all rows; with a `pagination`, the footer navigates the pages.
- [Pagination With Has Next Page](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--pagination-with-has-next-page) — A server that cannot count its rows returns whether another page follows, `hasNextPage`, instead of `dataLength`.
- [Infinite Scrolling](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--infinite-scrolling) — Without a `pagination`, the pages stream in one after another as the grid is scrolled to its end.
- [Infinite Scrolling With Has Next Page](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--infinite-scrolling-with-has-next-page) — With `hasNextPage`, the stream stops at the first page that has none after it.
- [Failing Page](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--failing-page) — Every third page fails: the stream stops instead of retrying on its own, and the `infinite-scroll-indicator` part offers a retry button.
- [Auto Refetch](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--auto-refetch) — `autoRefetch` fetches again every 5 seconds here; the refetch button in the toolbar fetches at once, and a right click on it changes the interval.
- [Silent Fetch](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-fetchable-data-grid--silent-fetch) — `silentFetch` keeps the rows while a fetch runs instead of showing a spinner, and open sub rows stay open: open a department and a team, then wait for the refetch.

## API

### `mo-fetchable-data-grid`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `hasInfiniteScroll` |  | `boolean` |  | Whether pages stream into the grid as the user scrolls instead of being navigated explicitly. |
| `fetch` | `fetch` | `(parameters: TDataFetcherParameters) => Promise<FetchableDataGridResult<TData>>` | `"() => Promise.resolve([])"` | A function that fetches the data from the server. |
| `silentFetch` | `silentFetch` | `boolean` | `false` | If set, the DataGrid's content will not be cleared when the fetch is initiated. |
| `parameters` | `parameters` | `TDataFetcherParameters \| undefined` |  | The parameters that are passed to the fetch function. |
| `paginationParameters` | `paginationParameters` | `((parameters: { readonly page: number; readonly pageSize: number; }) => Partial<TDataFetcherParameters>) \| undefined` |  | The parameters that are passed to the fetch function when the page changes. This enables server-side pagination, whose pages are streamed into the grid as the user scrolls unless the resolved `pagination` opts into explicit page navigation. |
| `sortParameters` | `sortParameters` | `(() => Partial<TDataFetcherParameters>) \| undefined` |  | The parameters that are passed to the fetch function when the sort changes. This enables server-side sorting. |
| `autoRefetch` | `autoRefetch` | `number \| undefined` |  | The interval in seconds at which the data should be refetched automatically. If set, the DataGrid will automatically refetch the data at the specified interval. |
| `rows` |  | `DataGridRow<TData, TDetailsElement>[]` |  | The rendered rows, sub rows included, in the order of their records. |
| `resolvedPagination` |  | `{ readonly strategy: DataGridPaginationStrategy; readonly size: DataGridPaginationSize; } \| undefined` |  | Resolves effective pagination configuration from property, static default, and fallback. |
| `data` | `data` | `TData[]` | `"new Array<TData>()"` | The data to be displayed in the DataGrid. It is an array of objects, where each object represents a row. |
| `columns` | `columns` | `DataGridColumn<TData, any>[]` |  | The columns of the DataGrid, composed of their definitions and modifications. Assigning it gives the definitions in code, which column elements override. |
| `headerHidden` | `headerHidden` | `boolean` | `false` | Whether the header should be hidden. |
| `page` | `page` | `number` | `1` | The current page. |
| `pagination` | `pagination` | `DataGridPagination \| undefined` |  | How the rows are paged: a strategy, `pages` or `scroll`, and a size, a number or `auto` to fit the height, e.g. `pages`, `pages 50` or `50`. |
| `sorting` | `sorting` | `DataGridSorting<TData> \| undefined` |  | The sorting mode. It is an object with `selector` and `strategy` properties. |
| `selectability` | `selectability` | `Selectability \| undefined` |  | The selection mode. Defaults to 'single' if context menus available, 'undefined' otherwise. |
| `isDataSelectable` | `isDataSelectable` | `((data: TData) => boolean) \| undefined` |  | Whether data of a given row is selectable. |
| `selectedData` | `selectedData` | `TData[]` | `"new Array<TData>()"` | The selected data. |
| `selectOnClick` | `selectOnClick` | `boolean` | `false` | Whether the row should be selected on click. |
| `selectionBehaviorOnDataChange` | `selectionBehaviorOnDataChange` | `SelectabilityBehaviorOnItemsChange` | `"reset"` | The behavior of the selection when the data changes. |
| `reorderability` | `reorderability` | `boolean \| undefined` |  | Whether rows can be dragged into another order, which works while nothing is sorted and no row has details or sub rows. |
| `multipleDetails` | `multipleDetails` | `boolean` | `false` | Whether multiple details can be opened at the same time. |
| `subDataGridDataSelector` | `subDataGridDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The key path of the sub data grid data. |
| `hasDataDetail` | `hasDataDetail` | `((data: TData) => boolean) \| undefined` |  | Whether the data has a detail. |
| `detailsOnClick` | `detailsOnClick` | `boolean` | `false` | Whether the details should be opened on click. |
| `primaryContextMenuItemOnDoubleClick` | `primaryContextMenuItemOnDoubleClick` | `boolean` | `false` | Whether a double or middle click on a row clicks the `mo-data-grid-primary-context-menu-item` of its context menu. |
| `editability` | `editability` | `DataGridEditability` | `"never"` | The editability mode. |
| `getRowDetailsTemplate` | `getRowDetailsTemplate` | `((data: TData) => HTMLTemplateResult) \| undefined` |  | A function which returns a template for the details of a given row. |
| `getRowContextMenuTemplate` | `getRowContextMenuTemplate` | `((data: TData[]) => HTMLTemplateResult) \| undefined` |  | A function which returns a template for the context menu of a given row. |
| `filtersOpen` | `filtersOpen` | `boolean` | `false` | Whether the elements of the `filter` slot are shown. The filter button of the toolbar toggles it. |
| `hasAlternatingBackground` | `hasAlternatingBackground` | `boolean` |  | Whether the rows should have alternating background. |
| `cellFontSize` | `cellFontSize` | `number` | `"value"` | The font size of the cells in rem, between 0.8 and 1.2. Defaults to `DataGrid.cellRelativeFontSize`, 0.8. |
| `rowHeight` | `rowHeight` | `number` | `"DataGrid.rowHeight.value"` | The height of the rows in pixels, between 30 and 60. Defaults to `DataGrid.rowHeight`, 35. |
| `exportable` | `exportable` | `boolean` | `false` | Whether the DataGrid is exportable. This will show an export button in the footer. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `parametersChange` | `TDataFetcherParameters \| undefined` | The new parameters, whenever `setParameters()` changes them. |
| `dataFetch` | `FetchableDataGridResult<TData>` | The result of every fetch. |
| `dataChange` | `TData[]` |  |
| `selectionChange` | `TData[]` |  |
| `pageChange` | `number` |  |
| `paginationChange` | `DataGridPagination \| undefined` |  |
| `columnsChange` | `DataGridColumn<TData, any>[]` |  |
| `sortingChange` | `DataGridRankedSortDefinition<TData>[]` |  |
| `reorder` | `DataGridReorderChange<TData>[]` |  |
| `rowDetailsOpen` | `DataGridRow<TData, TDetailsElement>` |  |
| `rowDetailsClose` | `DataGridRow<TData, TDetailsElement>` |  |
| `rowClick` | `DataGridRow<TData, TDetailsElement>` |  |
| `rowDoubleClick` | `DataGridRow<TData, TDetailsElement>` |  |
| `rowMiddleClick` | `DataGridRow<TData, TDetailsElement>` |  |
| `cellEdit` | `DataGridCell<any, TData, TDetailsElement>` |  |

#### Slots

| Name | Description |
| --- | --- |
| `error-no-selection` | A slot for displaying an error message when user action is required in order for DataGrid to initiate the fetch. |
| `column` | The column elements, which assign themselves to it when placed in the grid. It is hidden. |
| `toolbar` | The horizontal bar above DataGrid's contents. |
| `toolbar-action` | A slot for action icon-buttons in the toolbar which are displayed on the end. |
| `filter` | Elements which filter DataGrid's data. When expanded, they continue the toolbar's row if they all fit into its remaining space, otherwise they wrap into rows of their own. It is toggled through an icon-button in the toolbar. |
| `sum` | A horizontal bar in the DataGrid's footer for showing sums. Calculated sums are also placed here by default. |
| `primary-action` | A slot at the very end of the toolbar expecting primary action elements (e.g. an "add" button) to be placed in. Slotted elements replace the slot's default content, but complement primary actions generated outside of it e.g. EntityDataGrid's create button, which is suppressed via "primaryActionHidden" instead. |
| `error-no-content` | A slot for displaying an error message when no data is available. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-data-grid-min-visible-rows` | The minimum number of visible rows. Defaults to 2.5. |
| `--mo-data-grid-footer-background` | The background of the footer. |
| `--mo-data-grid-cell-padding` | The inline padding of the cells. Defaults to 0.5rem. |
| `--mo-data-grid-column-sub-row-indentation` | The indentation of the first column in the sub row. Defaults to 20px. |

#### CSS parts

| Name | Description |
| --- | --- |
| `infinite-scroll-indicator` | The row at the end of the stream which indicates that more data is being loaded, or that loading it has failed. |

### `mo-fetchable-data-grid-refetch-icon-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `fetching` | `fetching` | `boolean` | `false` |  |
| `autoRefetch` | `autoRefetch` | `number \| undefined` |  |  |
| `template` |  | `HTMLTemplateResult` |  | The template rendered into renderRoot. Invoked on each update to perform rendering tasks. |

#### Events

| Name | Detail |
| --- | --- |
| `requestFetch` | `void` |
| `autoRefetchChange` | `number \| undefined` |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-fetchable-data-grid--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-fetchable-data-grid--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FetchableDataGrid)

## License

MIT © 3MO GmbH