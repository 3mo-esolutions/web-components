# Data Grid

A web component for data grids with typed columns, sorting, selection, pagination, row details and inline editing.

[![npm](https://img.shields.io/npm/v/@3mo/data-grid?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/data-grid) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-data-grid--overview)

A table that shows an array of objects as rows, with selection, sorting, pagination, details, editing and CSV export.

## Installation

```sh
npm install @3mo/data-grid
```

```ts
import '@3mo/data-grid'
```

## Usage

```html
<mo-data-grid .data=${twentyPeople} style='height: 500px' editability='never'>
	<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
	<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
	<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
</mo-data-grid>
```

## Examples

- [Sticky Columns](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--sticky-columns) — `sticky` pins a column to the `start`, to the `end` or to `both` while the others scroll by; the selection and menu columns stick as well.
- [Custom Cell Style](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--custom-cell-style) — `contentStyle` styles a cell by its value: negative balances in red, positive ones in green.
- [Column Menu Items](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--column-menu-items) — A column element of your own adds items to the menu under its heading - click the heading of the colored Address column.
- [Sums](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--sums) — `sumHeading` totals a number column in the footer, over the selected rows while there are any; the `sum` slot takes totals of your own.
- [Selection](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--selection) — `isDataSelectable` decides which rows can be selected, here only adults.
- [Details](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--details) — `getRowDetailsTemplate` renders what a row opens into, and `hasDataDetail` decides which rows have details, here only adults.
- [Sub Data Grid](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--sub-data-grid) — The details can hold any template, such as a grid of the row's children.
- [Sub Rows](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--sub-rows) — `subDataGridDataSelector` names the key path of a row's children, which open as sub rows under the same columns, level by level.
- [Editing](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--editing) — Here every editable cell edits at once, and `nonEditable` takes a predicate that keeps the ages over 30 read-only.
- [Sorting](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--sorting) — `sorting` sets the order to start with, by name and then by age; the arrow of a heading sorts by its column, and Shift+click adds it to the order.
- [Reordering](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--reordering) — `reorderability` adds a grip to drag rows by, and each drop fires `reorder`, which the Actions panel logs.
- [Filters](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--filters) — Elements in the `filter` slot open with the toolbar's filter button; they continue its row while they fit and wrap into rows of their own otherwise.
- [Primary Action](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--primary-action) — The `primary-action` slot places an element at the very end of the toolbar, after its icon buttons.
- [Primary Action With Split Button](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--primary-action-with-split-button) — Composite actions fit the slot as well, such as a split button with more options.
- [Context Menu](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--context-menu) — `getRowContextMenuTemplate` gives each row a menu, opened by a right click or its ⋮ button; `primaryContextMenuItemOnDoubleClick` runs the bold item on a double click.
- [Virtualization](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--virtualization) — A thousand rows on one page: scroll through them, select them all or export them.
- [Virtualized Sub Rows](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--virtualized-sub-rows) — 25 rows open into 40 sub rows each, like a products page with every variant expanded; scroll through it and watch the scrollbar hold still.
- [Min Visible Rows](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--min-visible-rows) — Without a height of its own, the grid shows at least `--mo-data-grid-min-visible-rows` rows, 2.5 by default and 10 here.
- [Export](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--export) — `exportable` adds a button to the footer that downloads the rows as CSV, sub rows included.
- [Empty State](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--empty-state) — Without data, the grid shows an empty state, which the `error-no-content` slot replaces.
- [In A Card](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--in-a-card) — In a `mo-card`, the grid spans the card's full width under its heading.
- [Custom Data Grid](https://3mo-esolutions.github.io/web-components/?path=/story/data-data-grids-data-grid--custom-data-grid) — Arrow keys move between cells, Space selects, Enter or a double click edits and Ctrl+C copies; a heading sorts when clicked, moves when dragged and resizes by its edge.

## Accessibility

A `grid`, or a `treegrid` with sub rows, with `aria-multiselectable` while multiple. The header is a `row` of `columnheader`s,
where the column sorted first says `aria-sort='ascending'` or `'descending'` and every other sortable one `'none'`. Rows are
`row`s with `aria-level`, `aria-setsize` and `aria-posinset`, `aria-selected` while rows can be selected and `aria-expanded`
where they have details or sub rows; cells are `gridcell`s.
One cell is in the tab order and takes real focus. The column headers are not part of the arrow navigation; their buttons are
ordinary tab stops.

| Key | Does |
| --- | --- |
| The arrows | The cell in that direction, wrapping at the edges. |
| `Home` `End` | The first or last cell of the row. |
| `Ctrl` `Home` / `End` | The first cell of the grid, or the last. |
| `PageUp` `PageDown` | A page of rows up or down. |
| `Enter` | Edits an editable cell; otherwise clicks it, which selects the row with `selectOnClick` and opens its details with `detailsOnClick`. |
| `Enter` `Escape` | While editing: ends it and returns to the cell; `Enter` commits, except in a text area. |
| `Ctrl` or `⌘` `C` | Copies the cell's text. |

With `selectOnClick`, moving to a cell selects its row, and `Shift` extends the selection. Where it differs from the ARIA
practices: the arrows wrap, `Space` does not select a row, and in a tree grid `ArrowRight` and `ArrowLeft` move between cells
rather than opening and closing rows.

## API

### `mo-data-grid`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
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

| Name | Detail |
| --- | --- |
| `dataChange` | `TData[]` |
| `selectionChange` | `TData[]` |
| `pageChange` | `number` |
| `paginationChange` | `DataGridPagination \| undefined` |
| `columnsChange` | `DataGridColumn<TData, any>[]` |
| `sortingChange` | `DataGridRankedSortDefinition<TData>[]` |
| `reorder` | `DataGridReorderChange<TData>[]` |
| `rowDetailsOpen` | `DataGridRow<TData, TDetailsElement>` |
| `rowDetailsClose` | `DataGridRow<TData, TDetailsElement>` |
| `rowClick` | `DataGridRow<TData, TDetailsElement>` |
| `rowDoubleClick` | `DataGridRow<TData, TDetailsElement>` |
| `rowMiddleClick` | `DataGridRow<TData, TDetailsElement>` |
| `cellEdit` | `DataGridCell<any, TData, TDetailsElement>` |

#### Slots

| Name | Description |
| --- | --- |
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

### `mo-data-grid-cell`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `value` | `value` | `TValue` |  |
| `column` | `column` | `DataGridColumn<TData, TValue>` |  |
| `row` | `row` | `DataGridRow<TData, TDetailsElement>` |  |

### `mo-data-grid-column-header`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `column` | `column` | `DataGridColumn<unknown, any>` |  |  |
| `menuOpen` | `menuOpen` | `boolean` | `false` |  |
| `template` |  | `HTMLTemplateResult` |  | The template rendered into renderRoot. Invoked on each update to perform rendering tasks. |

### `mo-data-grid-footer`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any>` |  |
| `page` | `page` | `number` | `1` |

### `mo-data-grid-header`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any>` |  |
| `overlayOpen` | `overlayOpen` | `boolean` | `false` |

### `mo-data-grid-header-separator`

The handle resizing a column, drawing a line where the pointer is while it drags.

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `column` | `column` | `DataGridColumn<unknown, any>` |  |

### `mo-data-grid-primary-context-menu-item`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the submenu is open. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the list item is disabled |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | Icon to be displayed in the list item |
| `preventClickOnSpace` | `preventClickOnSpace` | `boolean` | `false` | Whether the list item should prevent click on space |

#### Slots

| Name | Description |
| --- | --- |
| `submenu` | The items of the submenu. |
| (default) | Default slot for content |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon before the content. |

### `mo-data-grid-column-boolean`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `trueIcon` | `trueIcon` | `MaterialIcon` | `"done"` | Icon to show for true values |
| `falseIcon` | `falseIcon` | `MaterialIcon` | `"clear"` | Icon to show for false values |
| `trueIconColor` | `trueIconColor` | `string` | `"var(--mo-color-accent)"` | Color of the true icon |
| `falseIconColor` | `falseIconColor` | `string` | `"var(--mo-color-gray)"` | Color of the false icon |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-deletion`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `prevent` | `prevent` | `boolean` | `false` | Prevents the deletion button from being displayed |
| `icon` | `icon` | `MaterialIcon` | `"delete"` | The icon to display. Defaults to 'delete' |
| `tooltip` | `tooltip` | `string \| undefined` |  | The tooltip to display. Defaults to 'Delete position' |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `true` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean` | `true` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
| `getContentTemplate` | `getContentTemplate` | `(_: never, data?: TData \| undefined) => HTMLTemplateResult` |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

#### Events

| Name | Detail |
| --- | --- |
| `delete` | `TData` |

### `mo-data-grid-column-image`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `tooltipSelector` | `tooltipSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| ((data: TData) => string \| undefined) \| undefined `` |  | The data selector of the column to use as a tooltip. If a function is provided, it will be called with the data as an argument. |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `true` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean` | `true` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-text`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-date`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `formatOptions` | `formatOptions` | `DateTimeFormatOptions \| undefined` |  | Options to pass to DateTime.prototype.format() |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Day"` | The precision of the date/time. |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hides the date/time picker |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-date-range`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `formatOptions` | `formatOptions` | `DateTimeFormatOptions \| undefined` |  | Options to pass to DateTime.prototype.format() |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Day"` | The precision of the date/time. |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hides the date/time picker |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-date-time`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `formatOptions` | `formatOptions` | `DateTimeFormatOptions \| undefined` |  | Options to pass to DateTime.prototype.format() |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Minute"` | The precision of the date/time. |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hides the date/time picker |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-date-time-range`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `formatOptions` | `formatOptions` | `DateTimeFormatOptions \| undefined` |  | Options to pass to DateTime.prototype.format() |
| `precision` | `precision` | `FieldDateTimePrecision` | `"Minute"` | The precision of the date/time. |
| `pickerHidden` | `pickerHidden` | `boolean` | `false` | Hides the date/time picker |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"start"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-currency`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `currency` | `currency` | `Currency \| undefined` |  | The currency of the values. |
| `currencyDataSelector` | `currencyDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The key path to the currency of the values. |
| `formatOptions` | `formatOptions` | `NumberFormatOptions \| undefined` |  |  |
| `sumHeading` | `sumHeading` | `string \| undefined` | `"undefined"` |  |
| `min` | `min` | `number \| undefined` |  |  |
| `minDataSelector` | `minDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `max` | `max` | `number \| undefined` |  |  |
| `maxDataSelector` | `maxDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `step` | `step` | `number \| undefined` |  |  |
| `stepDataSelector` | `stepDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"end"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-number`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `formatOptions` | `formatOptions` | `NumberFormatOptions \| undefined` |  |  |
| `sumHeading` | `sumHeading` | `string \| undefined` | `"undefined"` |  |
| `min` | `min` | `number \| undefined` |  |  |
| `minDataSelector` | `minDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `max` | `max` | `number \| undefined` |  |  |
| `maxDataSelector` | `maxDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `step` | `step` | `number \| undefined` |  |  |
| `stepDataSelector` | `stepDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"end"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-column-percent`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `formatOptions` | `formatOptions` | `NumberFormatOptions \| undefined` |  |  |
| `sumHeading` | `sumHeading` | `string \| undefined` | `"undefined"` |  |
| `min` | `min` | `number \| undefined` |  |  |
| `minDataSelector` | `minDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `max` | `max` | `number \| undefined` |  |  |
| `maxDataSelector` | `maxDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `step` | `step` | `number \| undefined` |  |  |
| `stepDataSelector` | `stepDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  |  |
| `dataGrid` | `dataGrid` | `DataGrid<TData, any> \| undefined` |  |  |
| `width` | `width` | `string` | `"max-content"` | The width of the column |
| `hidden` | `hidden` | `boolean` | `false` | Whether the column is hidden. The column can be made visible by the user in the settings panel if available. |
| `heading` | `heading` | `string` | `""` | The heading of the column |
| `textAlign` | `textAlign` | `DataGridColumnAlignment` | `"end"` | The text alignment of the column |
| `description` | `description` | `string \| undefined` |  | The description of the column. It will be displayed as a tooltip on the heading. |
| `dataSelector` | `dataSelector` | `` object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never `` |  | The data selector of the column |
| `sortDataSelector` | `sortDataSelector` | `` (object extends Required<TData> ? string : TData extends readonly any[] ? Extract<keyof TData, `${number}`> \| Extract<keyof TData, string> \| SubKeyPathOf<...> : TData extends object ? Extract<...> \| SubKeyPathOf<...> : never) \| undefined `` |  | The data selector of the column |
| `nonSortable` | `nonSortable` | `boolean` | `false` | Whether the column is sortable |
| `nonEditable` | `nonEditable` | `boolean \| Predicate<TData>` | `false` | Whether the column is editable |
| `sticky` | `sticky` | `DataGridColumnSticky \| undefined` |  | The sticky position of the column, either 'start', 'end', or 'both' |
| `contentStyle` | `contentStyle` | `DataGridColumnContentStyle<TData, TValue> \| undefined` |  | The content style of the column. It can be a string, CSSResult, or a function that returns either based on the cell value and data. |
|  | `getContentTemplate` |  |  | The content template of the column. |
|  | `getEditContentTemplate` |  |  | The edit content template of the column. |

### `mo-data-grid-footer-sum`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `heading` | `heading` | `string` | `""` |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Sum of values |

### `mo-data-grid-default-row`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `dataRecord` | `dataRecord` | `DataRecord<TData>` |  |

#### Events

| Name | Detail |
| --- | --- |
| `contextmenu` |  |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-data-grid--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-data-grids-data-grid--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/DataGrid)

## License

MIT © 3MO GmbH
