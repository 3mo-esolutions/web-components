import { story, meta } from '../../.storybook/story.js'
import { html, ifDefined, style } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { DataGridSortingStrategy } from './index.js'

export default meta({
	title: 'DataGrid',
	component: 'mo-data-grid',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

type Person = { id: number, name: string, age: number, city: string }

const generatePeople = (count: number) => {
	const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt']
	const names = ['Max', 'Moritz', 'Mia', 'Maja', 'Mika']
	return new Array(count).fill(0).map((_, i) => ({
		id: i + 1,
		name: names[Math.floor(Math.random() * names.length)],
		age: Math.floor(Math.random() * 80),
		city: cities[Math.floor(Math.random() * cities.length)]
	}))
}

const fivePeople = generatePeople(5)
const thousandPeople = generatePeople(1000)

const fivePeopleWithChildren = fivePeople.map(p => ({
	...p,
	children: generatePeople(Math.floor(Math.random() * 10) + 1)
}))

const columnsTemplate = html`
	<mo-data-grid-column-number width='60px' primaryKey nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
	<mo-data-grid-column-number .nonEditable=${(person: Person) => person.age > 30} heading='Age' dataSelector='age'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
`

export const DataGrid = story({
	render: () => html`
		<mo-data-grid .data=${fivePeople} style='height: 500px'>
			${columnsTemplate}
		</mo-data-grid>
	`
})

export const Selection = story({
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
	render: ({ selectionMode, selectOnClick, selectionCheckboxesHidden }) => html`
		<mo-data-grid .data=${fivePeople} style='height: 500px' selectionMode=${selectionMode as any}
			?selectOnClick=${selectOnClick}
			?selectionCheckboxesHidden=${selectionCheckboxesHidden}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
})

export const ContextMenu = story({
	render: () => html`
		<mo-data-grid .data=${fivePeople} style='height: 500px' .getRowContextMenuTemplate=${(data: Array<Person>) => html`
			<div style='margin: 10px; opacity: 0.5'>${data.map(p => `"${p.name}"`).join(', ')} selected</div>
			<mo-context-menu-item>Item1</mo-context-menu-item>
			<mo-context-menu-item>Item2</mo-context-menu-item>
		`}>
			${columnsTemplate}
		</mo-data-grid>
	`
})

export const Sums = story({
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
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
			<mo-data-grid-column-currency heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
			<mo-data-grid-footer-sum slot='sum' heading='Customized Sum Maybe!' ${style({ alignItems: 'center', fontWeight: '800' })}>199,99 €</mo-data-grid-footer-sum>
		</mo-data-grid>
	`
})

export const Sorting = story({
	render: () => html`
		<mo-data-grid .data=${thousandPeople} pagination='auto' selectionMode='multiple' style='height: 500px' selectOnClick .sorting=${[{ selector: 'name', strategy: DataGridSortingStrategy.Ascending }, { selector: 'age', strategy: DataGridSortingStrategy.Descending }]}>
			<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
			<mo-data-grid-column-currency heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
		</mo-data-grid>
	`
})

export const RowDetails = story({
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
})

export const WithAutoSubDataGrid = story({
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
})

export const Editability = story({
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
	render: ({ editability }) => html`
		<p>
			This example also demonstrated how some columns can be partially editable by disabling the editability of people older than 30.
		</p>
		<mo-data-grid style='height: 500px'
			.data=${fivePeople}
			editability=${editability as any}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
})

export const WithFiltersWithoutToolbar = story({
	render: () => html`
		<mo-data-grid .data=${thousandPeople} style='height: 500px'>
			${columnsTemplate}
			<mo-checkbox slot='filter' label='Something'></mo-checkbox>
		</mo-data-grid>
	`
})

export const Virtualization = story({
	render: () => html`
		<mo-data-grid .data=${thousandPeople} style='height: 500px'>
			${columnsTemplate}
		</mo-data-grid>
	`
})

export const MinVisibleRows = story({
	args: {
		minVisibleRows: 10
	},
	render: ({ minVisibleRows }) => html`
		<mo-data-grid .data=${thousandPeople} ${style({ '--mo-data-grid-min-visible-rows': String(minVisibleRows) })}>
			${columnsTemplate}
		</mo-data-grid>
	`
})

export const Fab = story({
	args: {
		label: 'Add',
		withFooter: false,
	},
	render: ({ label, withFooter }) => html`
		<mo-data-grid .data=${thousandPeople} style='height: 500px' pagination=${ifDefined(withFooter ? 'auto' : undefined)}>
			${columnsTemplate}
			<mo-fab slot='fab' icon='add'>${label}</mo-fab>
		</mo-data-grid>
	`
})

export const Exportable = story({
	render: () => html`
		<mo-data-grid exportable pagination='auto' .data=${thousandPeople} style='height: 500px'>
			${columnsTemplate}
		</mo-data-grid>
	`
})