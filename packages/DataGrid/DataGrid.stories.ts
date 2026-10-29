import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import { DialogAlert } from '../StandardDialogs/index.js'
import { DataGridColumnBinder, DataGridEditability, DataGridSelectability, DataGridSortingStrategy } from './index.js'
import { fiftyPeople, fiveFamilies, fivePeople, hundredPeople, thousandPeople, twentyFiveLargeFamilies, twentyPeople, Person } from '../../stories/index.js'
import addressColumnSource from './stories/AddressColumn.ts?raw'
import customDataGridSource from './stories/CustomDataGrid.ts?raw'
import './stories/AddressColumn.js'
import './stories/CustomDataGrid.js'

type Args = {
	readonly headerHidden: boolean
	readonly selectability?: DataGridSelectability
	readonly selectOnClick: boolean
	readonly editability: DataGridEditability
	readonly hasAlternatingBackground: boolean
	readonly exportable: boolean
	readonly multipleDetails: boolean
	readonly detailsOnClick: boolean
}

export default {
	title: 'Data / Data Grids / Data Grid',
	component: 'mo-data-grid',
	args: {
		headerHidden: false,
		selectability: undefined,
		selectOnClick: false,
		editability: DataGridEditability.Never,
		hasAlternatingBackground: false,
		exportable: false,
	},
	argTypes: {
		selectability: { control: 'select', options: [undefined, DataGridSelectability.Single, DataGridSelectability.Multiple] },
		editability: { control: 'select', options: Object.values(DataGridEditability) },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ headerHidden, selectability, selectOnClick, editability, hasAlternatingBackground, exportable }) => html`
		<mo-data-grid .data=${twentyPeople}
			?headerHidden=${headerHidden}
			selectability=${selectability}
			?selectOnClick=${selectOnClick}
			editability=${editability}
			?hasAlternatingBackground=${hasAlternatingBackground}
			?exportable=${exportable}
		>
			<mo-data-grid-column-image heading='Avatar' dataSelector='avatar' tooltipSelector='name'></mo-data-grid-column-image>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/**
 * `DataGridColumnBinder.for(Person).bind(keyPath)` takes a column's data selector from the key path, its heading from `@label` and its description from `@description`.
 * A `@label.short` becomes the heading instead and the full label moves into the description, as for Job and Born.
 */
export const BoundColumns: Story = {
	render: () => {
		const { bind } = DataGridColumnBinder.for(Person)
		return html`
			<mo-data-grid .data=${twentyPeople}>
				<mo-data-grid-column-image ${bind('avatar')} tooltipSelector='name'></mo-data-grid-column-image>
				<mo-data-grid-column-text ${bind('name')}></mo-data-grid-column-text>
				<mo-data-grid-column-text ${bind('occupation')}></mo-data-grid-column-text>
				<mo-data-grid-column-date ${bind('birthDate')}></mo-data-grid-column-date>
				<mo-data-grid-column-text ${bind('country')}></mo-data-grid-column-text>
				<mo-data-grid-column-currency currency='EUR' ${bind('balance')}></mo-data-grid-column-currency>
			</mo-data-grid>
		`
	},
}

/** `sticky` pins a column to the `start`, to the `end` or to `both` while the others scroll by; the selection and menu columns stick as well. */
export const StickyColumns: Story = {
	render: () => html`
		<mo-data-grid .data=${twentyPeople} selectability='multiple'
			.getRowContextMenuTemplate=${() => html`
				<mo-context-menu-item icon='edit'>Edit</mo-context-menu-item>
				<mo-context-menu-item icon='delete'>Delete</mo-context-menu-item>
			`}
		>
			<mo-data-grid-column-text sticky='start' heading='Name' width='200px' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text sticky='both' heading='Name' width='200px' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-date sticky='end' heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** `contentStyle` styles a cell by its value: negative balances in red, positive ones in green. */
export const CustomCellStyle: Story = {
	render: () => html`
		<mo-data-grid .data=${twentyPeople}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-currency currency='EUR' heading='Balance' dataSelector='balance'
				.contentStyle=${(value: number) => {
					switch (Math.sign(value)) {
						case -1: return 'background: color-mix(in srgb, var(--mo-color-red), transparent 86%); color: var(--mo-color-red)'
						case 1: return 'background: color-mix(in srgb, var(--mo-color-green), transparent 86%); color: var(--mo-color-green)'
						default: return ''
					}
				}}
			></mo-data-grid-column-currency>
		</mo-data-grid>
	`,
}

/** A column element of your own adds items to the menu under its heading - click the heading of the colored Address column. */
export const ColumnMenuItems: Story = {
	parameters: sourceOf(addressColumnSource),
	render: () => html`
		<mo-data-grid .data=${twentyPeople}>
			<story-address-column heading='Address' dataSelector='address'></story-address-column>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** `sumHeading` totals a number column in the footer, over the selected rows while there are any; the `sum` slot takes totals of your own. */
export const Sums: Story = {
	render: () => html`
		<mo-data-grid .data=${fiftyPeople} selectability='multiple' selectOnClick style='height: 1000px; --mo-data-grid-footer-background: var(--mo-color-transparent-gray-3)'>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-currency currency='EUR' heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
			<mo-data-grid-footer-sum slot='sum' heading='Budget' style='font-weight: 800'>${(20000).formatAsCurrency('EUR')}</mo-data-grid-footer-sum>
		</mo-data-grid>
	`,
}

/** `isDataSelectable` decides which rows can be selected, here only adults. */
export const Selection: Story = {
	args: {
		selectability: DataGridSelectability.Single,
	},
	render: ({ selectability, selectOnClick }) => html`
		<mo-data-grid .data=${fivePeople} selectability=${selectability} ?selectOnClick=${selectOnClick}
			.isDataSelectable=${(person: Person) => person.age >= 18}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** `getRowDetailsTemplate` renders what a row opens into, and `hasDataDetail` decides which rows have details, here only adults. */
export const Details: Story = {
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid .data=${fivePeople} selectability='multiple' ?multipleDetails=${multipleDetails} ?detailsOnClick=${detailsOnClick}
			.hasDataDetail=${(person: Person) => person.age >= 18}
			.getRowDetailsTemplate=${(person: Person) => html`
				<div style='opacity: 0.5'>${person.address}</div>
			`}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** The details can hold any template, such as a grid of the row's children. */
export const SubDataGrid: Story = {
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid .data=${fiveFamilies} selectability='multiple' ?multipleDetails=${multipleDetails} ?detailsOnClick=${detailsOnClick}
			.getRowDetailsTemplate=${(person: Person) => html`
				<mo-data-grid .data=${person.children}>
					<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
					<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
					<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
				</mo-data-grid>
			`}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** `subDataGridDataSelector` names the key path of a row's children, which open as sub rows under the same columns, level by level. */
export const SubRows: Story = {
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid .data=${fiveFamilies} subDataGridDataSelector='children' selectability='multiple' ?multipleDetails=${multipleDetails} ?detailsOnClick=${detailsOnClick}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** Here every editable cell edits at once, and `nonEditable` takes a predicate that keeps the ages over 30 read-only. */
export const Editing: Story = {
	args: {
		editability: DataGridEditability.Always,
	},
	render: ({ editability }) => html`
		<mo-data-grid .data=${fivePeople} editability=${editability}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' .nonEditable=${(person: Person) => person.age > 30}></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** `sorting` sets the order to start with, by name and then by age; the arrow of a heading sorts by its column, and Shift+click adds it to the order. */
export const Sorting: Story = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople} pagination='pages' selectability='multiple' selectOnClick
			.sorting=${[{ selector: 'name', strategy: DataGridSortingStrategy.Ascending }, { selector: 'age', strategy: DataGridSortingStrategy.Descending }]}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-currency heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
		</mo-data-grid>
	`,
}

/** `reorderability` adds a grip to drag rows by, and each drop fires `reorder`, which the Actions panel logs. */
export const Reordering: Story = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople} pagination='pages' reorderability>
			<mo-data-grid-column-number sticky='start' heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-currency heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
		</mo-data-grid>
	`,
}

/** Elements in the `filter` slot open with the toolbar's filter button; they continue its row while they fit and wrap into rows of their own otherwise. */
export const Filters: Story = {
	render: () => html`
		<mo-data-grid .data=${twentyPeople} style='height: 300px'>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
			<mo-field-search slot='toolbar'></mo-field-search>
			<mo-field-select label='Name' slot='filter'>
				${twentyPeople.map(person => html`<mo-option value=${person.name}>${person.name}</mo-option>`)}
			</mo-field-select>
			<mo-field-date-range label='Birth Date' slot='filter'></mo-field-date-range>
			<mo-checkbox label='Positive balances only' slot='filter'></mo-checkbox>
		</mo-data-grid>
	`,
}

/** The `primary-action` slot places an element at the very end of the toolbar, after its icon buttons. */
export const PrimaryAction: Story = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
			<mo-field-search slot='toolbar'></mo-field-search>
			<mo-field-select label='Name' slot='filter'></mo-field-select>
			<mo-loading-button slot='primary-action' type='filled' startIcon='add'>Create</mo-loading-button>
		</mo-data-grid>
	`,
}

/** Composite actions fit the slot as well, such as a split button with more options. */
export const PrimaryActionWithSplitButton: Story = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
			<mo-field-search slot='toolbar'></mo-field-search>
			<mo-field-select label='Name' slot='filter'></mo-field-select>
			<mo-split-button slot='primary-action'>
				<mo-loading-button startIcon='add'>Create</mo-loading-button>
				<mo-menu-item slot='more' icon='upload'>Import</mo-menu-item>
			</mo-split-button>
		</mo-data-grid>
	`,
}

/** `getRowContextMenuTemplate` gives each row a menu, opened by a right click or its ⋮ button; `primaryContextMenuItemOnDoubleClick` runs the bold item on a double click. */
export const ContextMenu: Story = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople} pagination='pages' primaryContextMenuItemOnDoubleClick
			.getRowContextMenuTemplate=${(people: Array<Person>) => html`
				<mo-data-grid-primary-context-menu-item icon='visibility' @click=${() => new DialogAlert({ heading: people.map(person => person.name).join(', ') }).confirm()}>View</mo-data-grid-primary-context-menu-item>
				<mo-context-menu-item icon='edit'>Edit</mo-context-menu-item>
			`}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** A thousand rows on one page: scroll through them, select them all or export them. */
export const Virtualization: Story = {
	render: () => html`
		<mo-data-grid .data=${thousandPeople} pagination='100000' selectability='multiple' exportable>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** 25 rows open into 40 sub rows each, like a products page with every variant expanded through `detailsOpen`; scroll through it and watch the scrollbar hold still. */
export const VirtualizedSubRows: Story = {
	render: () => html`
		<mo-data-grid .data=${twentyFiveLargeFamilies} subDataGridDataSelector='children' selectability='multiple' multipleDetails detailsOpen detailsOnClick
			.getRowContextMenuTemplate=${() => html`<mo-context-menu-item icon='edit'>Edit</mo-context-menu-item>`}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** A `height`, a `max-height` or a share of a flex or grid container of a definite size gives the grid a height, which it takes and scrolls its rows in. Paging without a size, as many rows as fit make a page. */
export const ConstrainedHeight: Story = {
	decorators: [story => html`<div style='display: flex; gap: 1rem; align-items: start'>${story()}</div>`],
	render: () => html`
		<mo-data-grid .data=${hundredPeople} pagination='pages' style='flex: 1; max-height: 400px'>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
		<mo-flex style='flex: 1; height: 400px'>
			<mo-heading typography='heading5'>People</mo-heading>
			<mo-data-grid .data=${hundredPeople}>
				<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
				<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
				<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
			</mo-data-grid>
		</mo-flex>
	`,
}

/** `exportable` adds a button to the footer that downloads the rows as CSV, sub rows included. */
export const Export: Story = {
	render: () => html`
		<mo-data-grid .data=${fiveFamilies} subDataGridDataSelector='children' pagination='pages' exportable>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** Without data, the grid shows an empty state, which the `error-no-content` slot replaces. */
export const EmptyState: Story = {
	render: () => html`
		<mo-data-grid>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
		</mo-data-grid>
	`,
}

/** In a `mo-card`, the grid spans the card's full width under its heading. */
export const InACard: Story = {
	render: () => html`
		<mo-card heading='People' style='height: 400px'>
			<mo-data-grid .data=${twentyPeople}>
				<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
				<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
				<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
			</mo-data-grid>
		</mo-card>
	`,
}

/** Arrow keys move between cells, Space selects, Enter or a double click edits and Ctrl+C copies; a heading sorts when clicked, moves when dragged and resizes by its edge. */
export const CustomDataGrid: Story = {
	parameters: sourceOf(customDataGridSource),
	render: () => html`<story-custom-data-grid></story-custom-data-grid>`,
}
