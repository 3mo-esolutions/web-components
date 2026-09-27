# Entity Data Grid

A web component for fetchable data grids that create, edit and delete entities through dialogs and a context menu.

[![npm](https://img.shields.io/npm/v/@3mo/entity-data-grid?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/entity-data-grid) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-entity-data-grid--overview)

A fetchable data grid that creates, edits and deletes its rows through functions or entity dialogs, refetching after each.

## Installation

```sh
npm install @3mo/entity-data-grid
```

```ts
import '@3mo/entity-data-grid'
```

## Usage

```html
<mo-entity-data-grid style='height: 500px' selectability='multiple'
	.parameters=${{}}
	.fetch=${() => new Promise(resolve => setTimeout(() => resolve([
		{ id: 1, name: 'Octavia Blake', age: 34, city: 'Berlin' },
		{ id: 2, name: 'Clarke Griffin', age: 27, city: 'Hamburg' },
		{ id: 3, name: 'Raven Reyes', age: 29, city: 'München' },
		{ id: 4, name: 'Marcus Kane', age: 52, city: 'Frankfurt' },
	]), 1000))}
	.create=${create}
	.edit=${edit}
	.delete=${remove}
>
	<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
	<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
</mo-entity-data-grid>
```

## Examples

- [Dialogs](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-entity-data-grid--dialogs) — `createOrEdit` takes an entity dialog, which the add button opens to create a person and a row's Edit or a double click to edit one; the grid refetches after each.
- [Editable And Deletable](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-entity-data-grid--editable-and-deletable) — `isEntityEditable` and `isEntityDeletable` take Edit and Delete out of the menu of the rows they reject: here people under 21 cannot be edited and people under 25 cannot be deleted.
- [Context Menu](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-entity-data-grid--context-menu) — `rowContextMenuTemplate` adds items of your own above Edit and Delete.
- [Create Hidden](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-entity-data-grid--create-hidden) — `createHidden` leaves out the add button while `create` stays available, for a grid whose creation starts elsewhere.

## API

### `mo-entity-data-grid`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `create` | `create` | `CreateAction \| Constructor<EntityDialogComponent<TEntity, FetchableDialogComponentParameters, TEntity>> \| undefined` |  | Creates an entity: a function, or an `EntityDialogComponent` class the grid opens. Adds a create button to the toolbar. |
| `edit` | `edit` | `Constructor<EntityDialogComponent<TEntity, FetchableDialogComponentParameters, TEntity>> \| EditAction<...> \| undefined` |  | Edits an entity: a function, or an `EntityDialogComponent` class the grid opens with the entity's `id`. Adds Edit to the menu of a row. |
| `isEntityEditable` | `isEntityEditable` | `((entity: TEntity) => boolean) \| undefined` |  | A predicate that determines whether an entity is editable. |
| `createOrEdit` | `createOrEdit` | `Constructor<EntityDialogComponent<TEntity, FetchableDialogComponentParameters, TEntity>> \| CreateOrEditAction<...> \| undefined` |  | Sets both `create` and `edit`, typically to one entity dialog. |
| `delete` | `delete` | `((...entities: TEntity[]) => void \| PromiseLike<void>) \| undefined` |  | A function that deletes the given entities. Adds Delete to the menu of a row. |
| `isEntityDeletable` | `isEntityDeletable` | `((entity: TEntity) => boolean) \| undefined` |  | A predicate that determines whether an entity is deletable. |
| `rowContextMenuTemplate` | `rowContextMenuTemplate` | `((rowData: TEntity[]) => TemplateResult) \| undefined` |  | A function that returns items of your own for the menu of the given rows, placed above Edit and Delete. |
| `createHidden` | `createHidden` | `boolean` | `false` | Whether to hide the primary action button generated for the create action. |
| `hasInfiniteScroll` |  | `boolean` |  | Whether pages stream into the grid as the user scrolls instead of being navigated explicitly. |
| `fetch` | `fetch` | `(parameters: TDataFetcherParameters) => Promise<FetchableDataGridResult<TData>>` | `"() => Promise.resolve([])"` | A function that fetches the data from the server. |
| `silentFetch` | `silentFetch` | `boolean` | `false` | If set, the DataGrid's content will not be cleared when the fetch is initiated. |
| `parameters` | `parameters` | `TDataFetcherParameters` | `{}` | The parameters that are passed to the fetch function. |
| `paginationParameters` | `paginationParameters` | `((parameters: { readonly page: number; readonly pageSize: number; }) => Partial<TDataFetcherParameters>) \| undefined` |  | The parameters that are passed to the fetch function when the page changes. This enables server-side pagination, whose pages are streamed into the grid as the user scrolls unless the resolved `pagination` opts into explicit page navigation. |
| `sortParameters` | `sortParameters` | `(() => Partial<TDataFetcherParameters>) \| undefined` |  | The parameters that are passed to the fetch function when the sort changes. This enables server-side sorting. |
| `autoRefetch` | `autoRefetch` | `number \| undefined` |  | The interval in seconds at which the data should be refetched automatically. If set, the DataGrid will automatically refetch the data at the specified interval. |
| `rows` |  | `DataGridRow<TData, TDetailsElement>[]` |  | The rendered rows, sub rows included, in the order of their records. |
| `hasPrimaryAction` |  | `boolean` |  | The generated create button lives in |
| `resolvedPagination` |  | `{ readonly strategy: DataGridPaginationStrategy; readonly size: DataGridPaginationSize; } \| undefined` |  | Resolves effective pagination configuration from property, static default, and fallback. |
| `data` | `data` | `TData[]` | `"new Array<TData>()"` | The data to be displayed in the DataGrid. It is an array of objects, where each object represents a row. |
| `columns` | `columns` | `DataGridColumn<TData, any>[]` |  | The read-only columns of the DataGrid, composed of their definitions and modifications. Provide columns programmatically via `columns.definitions.programmatic`. |
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
| `primaryContextMenuItemOnDoubleClick` | `primaryContextMenuItemOnDoubleClick` | `true` | `true` | Whether a double or middle click on a row clicks the `mo-data-grid-primary-context-menu-item` of its context menu. |
| `editability` | `editability` | `DataGridEditability` | `"never"` | The editability mode. |
| `getRowDetailsTemplate` | `getRowDetailsTemplate` | `((data: TData) => HTMLTemplateResult) \| undefined` |  | A function which returns a template for the details of a given row. |
| `getRowContextMenuTemplate` | `getRowContextMenuTemplate` | `(entities: TEntity[]) => HTMLTemplateResult` |  | A function which returns a template for the context menu of a given row. |
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

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-entity-data-grid--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-entity-data-grid--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/EntityDataGrid)

## License

MIT © 3MO GmbH