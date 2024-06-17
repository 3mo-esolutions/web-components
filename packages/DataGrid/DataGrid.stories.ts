import type { Meta, StoryObj } from '@storybook/web-components'
import { html, ifDefined, style } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { DataGridSortingStrategy } from './index.js'

export default {
	title: 'Data Grid',
	component: 'mo-data-grid',
	package: p,
} as Meta

type Person = { id: number, name: string, age: number, birthDate: DateTime, address: string }

const generatePeople = (count: number) => {
	const names = ['Octavia Blake', 'Charmaine Diyoza', 'Clarke Griffin', 'Elliot Anderson', 'Darlene Anderson', 'Max Caufield']
	const addresses = [
		'112 Rue de Elm, 1265 Paris, France',
		'1234 Elm Street, Springfield, IL 62701, USA',
		'7234 Elmstraße, 21001 Berlin, Deutschland',
		'9692 Elm Street, Springfield, NSW 62701, Australia',
		'7792 Elm Street, London, England',
	]

	return new Array(count).fill(0).map((_, i) => {
		const birthDate = new DateTime().add({ days: -Math.floor(Math.random() * 365 * 80) })
		return {
			id: i + 1,
			name: names[Math.floor(Math.random() * names.length)],
			birthDate,
			age: Math.floor((new DateTime().since(birthDate).years)),
			address: addresses[Math.floor(Math.random() * addresses.length)],
		}
	})
}

const fivePeople = generatePeople(5)
const twentyPeople = generatePeople(20)
const hundredPeople = generatePeople(100)
const thousandPeople = generatePeople(1000)

const fivePeopleWithChildren = fivePeople.map(p => ({
	...p,
	children: generatePeople(Math.floor(Math.random() * 10) + 1)
}))

const columnsTemplate = html`
	<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='Name' width='200px' dataSelector='name'></mo-data-grid-column-text>
	<mo-data-grid-column-number .nonEditable=${(person: Person) => person.age > 30} heading='Age' dataSelector='age'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
	<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate'></mo-data-grid-column-date>
`

export const DataGrid: StoryObj = {
	render: () => html`
		<mo-data-grid .data=${twentyPeople} style='height: 500px'>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const Selection: StoryObj = {
	args: {
		selectionMode: 'single',
		selectOnClick: false,
		selectionCheckboxesHidden: false,
	},
	argTypes: {
		selectionMode: {
			control: {
				type: 'select',
				options: ['single', 'multiple']
			}
		}
	},
	parameters: {
		docs: {
			description: {
				story: 'This example also demonstrates how the selection can be restricted to people older than 18.'
			},
		}
	},
	render: ({ selectionMode, selectOnClick, selectionCheckboxesHidden }) => html`
		<mo-data-grid .data=${fivePeople} style='height: 500px' selectionMode=${selectionMode as any}
			?selectOnClick=${selectOnClick}
			?selectionCheckboxesHidden=${selectionCheckboxesHidden}
			.isDataSelectable=${(person: Person) => person.age >= 18}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const ContextMenu: StoryObj = {
	render: () => html`
		<mo-data-grid .data=${fivePeople} style='height: 500px' .getRowContextMenuTemplate=${(data: Array<Person>) => html`
			<div style='margin: 10px; opacity: 0.5'>${data.map(p => `"${p.name}"`).join(', ')} selected</div>
			<mo-context-menu-item>Item1</mo-context-menu-item>
			<mo-context-menu-item>Item2</mo-context-menu-item>
		`}>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const StickyColumns: StoryObj = {
	render: () => html`
		<mo-data-grid style='height: 500px' .data=${twentyPeople}
		selectionMode='multiple'
		.getRowContextMenuTemplate=${(data: Array<Person>) => html`
			<div style='margin: 10px; opacity: 0.5'>${data.map(p => `"${p.name}"`).join(', ')} selected</div>
			<mo-context-menu-item>Item1</mo-context-menu-item>
			<mo-context-menu-item>Item2</mo-context-menu-item>
		`}>
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
	`
}

export const Sums: StoryObj = {
	render: () => html`
		<mo-data-grid
			.data=${generatePeople(50).map(x => ({ ...x, balance: Math.floor(Math.random() * 1000) }))}
			selectionMode='multiple'
			style='height: 500px; --mo-data-grid-footer-background: var(--mo-color-transparent-gray-3)'
			selectOnClick
		>
			<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-currency currency='EUR' heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
			<mo-data-grid-footer-sum slot='sum' heading='Customized Sum!' ${style({ fontWeight: '800' })}>${199.0.formatAsCurrency('EUR')}</mo-data-grid-footer-sum>
		</mo-data-grid>
	`
}

export const Sorting: StoryObj = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople} pagination='auto' selectionMode='multiple' style='height: 500px' selectOnClick .sorting=${[{ selector: 'name', strategy: DataGridSortingStrategy.Ascending }, { selector: 'age', strategy: DataGridSortingStrategy.Descending }]}>
			<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-currency heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
		</mo-data-grid>
	`
}

export const RowDetails: StoryObj = {
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid style='height: 500px'
			.data=${fivePeople}
			?multipleDetails=${multipleDetails}
			?detailsOnClick=${detailsOnClick}
			.getRowDetailsTemplate=${(p: Person) => Math.random() > 0.5 ? html`
				<div style='margin: 10px; opacity: 0.5'>${p.name} details</div>
			` : html`
				<mo-data-grid .data=${generatePeople(5)} style='height: 200px'>
					${columnsTemplate}
				</mo-data-grid>
			`}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const WithAutoSubDataGrid: StoryObj = {
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid style='height: 500px'
			selectionMode='multiple'
			?multipleDetails=${multipleDetails}
			?detailsOnClick=${detailsOnClick}
			.data=${fivePeopleWithChildren}
			subDataGridDataSelector='children'
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const Editability: StoryObj = {
	args: {
		editability: 'always'
	},
	argTypes: {
		editability: {
			control: {
				type: 'select',
				options: ['never', 'cell', 'always']
			}
		}
	},
	parameters: {
		docs: {
			description: {
				story: 'This example also demonstrated how some columns can be partially editable by disabling the editability of people older than 30.',
			},
		}
	},
	render: ({ editability }) => html`
		<mo-data-grid style='height: 500px'
			.data=${fivePeople}
			editability=${editability as any}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const WithFiltersWithoutToolbar: StoryObj = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople} style='height: 500px'>
			${columnsTemplate}
			<mo-checkbox slot='filter' label='Something'></mo-checkbox>
		</mo-data-grid>
	`
}

export const Virtualization: StoryObj = {
	render: () => html`
		<mo-flex gap='10px'>
			<mo-data-grid .data=${thousandPeople} style='height: 500px'>
				${columnsTemplate}
			</mo-data-grid>
		</mo-flex>
	`
}

export const MinVisibleRows: StoryObj = {
	args: {
		minVisibleRows: 10
	},
	render: ({ minVisibleRows }) => html`
		<mo-data-grid .data=${hundredPeople} ${style({ '--mo-data-grid-min-visible-rows': String(minVisibleRows) })}>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const Fab: StoryObj = {
	args: {
		label: 'Add',
		withFooter: false,
	},
	render: ({ label, withFooter }) => html`
		<mo-data-grid .data=${hundredPeople} style='height: 500px' pagination=${ifDefined(withFooter ? 'auto' : undefined)}>
			${columnsTemplate}
			<mo-fab slot='fab' icon='add'>${label}</mo-fab>
		</mo-data-grid>
	`
}

export const Exportable: StoryObj = {
	render: () => html`
		<mo-data-grid exportable subDataGridDataSelector='children' pagination='auto' .data=${fivePeopleWithChildren} style='height: 500px'>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const NoContent: StoryObj = {
	render: () => html`
		<mo-data-grid style='height: 500px'>
			${columnsTemplate}
		</mo-data-grid>
	`
}