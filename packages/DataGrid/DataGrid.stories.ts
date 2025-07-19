import type { Meta, StoryObj } from '@storybook/web-components'
import { html, ifDefined, style, type HTMLTemplateResult } from '@a11d/lit'
import p from './package.json'
import { DataGridEditability, DataGridSelectionBehaviorOnDataChange, DataGridSelectability, DataGridSortingStrategy, DataGridColumnText, type DataGridColumnMenuItems } from './index.js'
import { DialogAlert } from '../StandardDialogs/index.js'

export default {
	title: 'Data Display / Data Grid',
	component: 'mo-data-grid',
	argTypes: {
		headerHidden: { control: 'boolean' },
		preventVerticalContentScroll: { control: 'boolean' },
		selectability: {
			control: 'select',
			options: [undefined, DataGridSelectability.Single, DataGridSelectability.Multiple]
		},
		selectOnClick: { control: 'boolean', type: 'boolean' },
		selectionBehaviorOnDataChange: {
			control: 'select',
			options: [DataGridSelectionBehaviorOnDataChange.Reset, DataGridSelectionBehaviorOnDataChange.Maintain, DataGridSelectionBehaviorOnDataChange.Prevent]
		},
		multipleDetails: { control: 'boolean' },
		subDataGridDataSelector: { control: 'text' },
		hasDataDetail: { control: 'boolean' },
		detailsOnClick: { control: 'boolean' },
		primaryContextMenuItemOnDoubleClick: { control: 'text' },
		editability: {
			control: {
				type: 'select',
				options: [DataGridEditability.Never, DataGridEditability.Cell, DataGridEditability.Always]
			}
		},
		sidePanelHidden: { control: 'boolean' },
		hasAlternatingBackground: { control: 'boolean' },
		preventFabCollapse: { control: 'boolean' },
		exportable: { control: 'boolean' }
	},
	package: p,
} as Meta

class Person {
	private static get people() {
		return [
			new Person({ id: 1, name: 'Octavia Blake', birthDate: new DateTime('2007-06-17'), address: '112 Rue de Elm, 1265 Paris, France' }),
			new Person({ id: 2, name: 'Charmaine Diyoza', birthDate: new DateTime('2001-06-30'), address: '1234 Elm Street, Springfield, IL 62701, USA' }),
			new Person({ id: 3, name: 'Clarke Griffin', birthDate: new DateTime('2008-10-13'), address: '7234 Elmstraße, 21001 Berlin, Deutschland' }),
			new Person({ id: 4, name: 'Elliot Alderson', birthDate: new DateTime('1986-09-17'), address: '9692 Elm Street, Springfield, NSW 62701, Australia' }),
			new Person({ id: 5, name: 'Arya Stark', birthDate: new DateTime('2002-03-29'), address: '7792 Elm Street, London, England' }),
			new Person({ id: 6, name: 'Darlene Alderson', birthDate: new DateTime('1990-11-05'), address: '1232 Elm Street, "P-432"' }),
			new Person({ id: 7, name: 'Max Caufield', birthDate: new DateTime('1995-09-21'), address: '1232 Elm Street, "P-432"' }),
		]
	}

	static generate(count: number) {
		return new Array(count)
			.fill(0)
			.map((_, i) => this.people[i % this.people.length])
	}

	readonly id!: number
	readonly name!: string
	readonly birthDate!: DateTime
	readonly address!: string
	readonly children?: Array<Person>


	constructor(init?: Partial<Person>) {
		Object.assign(this, init)
	}

	get age() {
		return Math.floor((new DateTime().since(this.birthDate).years))
	}
}


const fivePeople = Person.generate(5)
const twentyPeople = Person.generate(20)
const hundredPeople = Person.generate(100)
const thousandPeople = Person.generate(1000)

const fivePeopleWithChildren = fivePeople.map(p => new Person({
	...p,
	children: Person.generate(Math.floor(Math.random() * 10) + 1).map(c => new Person({
		...c,
		children: Person.generate(Math.floor(Math.random() * 5) + 1) as any,
	}))!
}))

const columnsTemplate = html`
	<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
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
		selectability: 'single',
		selectOnClick: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'This example also demonstrates how the selection can be restricted to people older than 18.'
			},
		}
	},
	render: ({ selectability, selectOnClick }) => html`
		<mo-data-grid .data=${fivePeople} style='height: 500px' selectability=${selectability as any}
			?selectOnClick=${selectOnClick}
			.isDataSelectable=${(person: Person) => person.age >= 18}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const ContextMenu: StoryObj = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople} pagination='auto' style='height: 500px' .getRowContextMenuTemplate=${() => html`
			<mo-context-menu-item>Item 1</mo-context-menu-item>
			<mo-context-menu-item @click=${() => new DialogAlert({ heading: 'Test' }).confirm()}>Item 2</mo-context-menu-item>
		`}>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const StickyColumns: StoryObj = {
	render: () => html`
		<mo-data-grid style='height: 500px' .data=${twentyPeople}
			selectability='multiple'
			.getRowContextMenuTemplate=${() => html`
				<mo-context-menu-item>Item 1</mo-context-menu-item>
				<mo-context-menu-item>Item 2</mo-context-menu-item>
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
			.data=${Person.generate(50).map(x => ({ ...x, balance: Math.floor(Math.random() * 1000) }))}
			selectability='multiple'
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
		<mo-data-grid .data=${hundredPeople} pagination='auto' selectability='multiple' style='height: 500px' selectOnClick .sorting=${[{ selector: 'name', strategy: DataGridSortingStrategy.Ascending }, { selector: 'age', strategy: DataGridSortingStrategy.Descending }]}>
			<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-currency heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
		</mo-data-grid>
	`
}

export const WithDetails: StoryObj = {
	name: 'With Details',
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid style='height: 500px'
			.data=${fivePeople}
			selectability='multiple'
			?multipleDetails=${multipleDetails}
			?detailsOnClick=${detailsOnClick}
			.hasDataDetail=${(p: Person) => p.age >= 18}
			.getRowDetailsTemplate=${(p: Person) => html`
				<div style='opacity: 0.5'>${p.name} details</div>
			`}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const WithDetails_SubDataGrid: StoryObj = {
	name: 'With Details - Sub Data Grid',
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid style='height: 500px'
			.data=${fivePeople}
			selectability='multiple'
			?multipleDetails=${multipleDetails}
			?detailsOnClick=${detailsOnClick}
			.hasDataDetail=${(p: Person) => p.age >= 18}
			.getRowDetailsTemplate=${() => html`
				<mo-data-grid .data=${Person.generate(5)}>
					${columnsTemplate}
				</mo-data-grid>
			`}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const WithDetails_SubRows: StoryObj = {
	name: 'With Details - Sub Rows',
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid style='height: 500px'
			selectability='multiple'
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
	parameters: {
		docs: {
			description: {
				story: 'This example also demonstrates how some columns can be partially editable by disabling the editability of people older than 30.',
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
			<mo-data-grid exportable .data=${thousandPeople} selectability='multiple' style='height: 500px' pagination='100000'>
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


export const WithCustomMenuItems: StoryObj = {
	render: () => {
		if (!customElements.get('mo-story-custom-address-column')) {
			customElements.define('mo-story-custom-address-column', class CustomAddressColumn<TData> extends DataGridColumnText<TData> {
				override getContentTemplate(value: string | undefined, data: TData): HTMLTemplateResult {
					return html`
						<span style='color: var(--mo-color-accent)'>
							${super.getContentTemplate(value, data)}
						</span>
				`
				}
				override getMenuItemsTemplate(): DataGridColumnMenuItems {
					return new Map([
						['sorting', html`
							<mo-selectable-menu-item icon='my_location' selected>Sort by Street</mo-selectable-menu-item>
							<mo-selectable-menu-item icon='location_city'>Sort by Zip Code</mo-selectable-menu-item>
						`],
						['more', html`
							<mo-menu-item icon='location_off'>Hide icon</mo-menu-item>
						`]
					])
				}
			})
		}
		return html`
			<div style='margin-bottom: 10px'>
				Open the context menu of the colored address column to see the custom menu items.
			</div>
			<mo-data-grid style='height: 500px' .data=${twentyPeople}>
				<mo-story-custom-address-column heading='Custom Address' dataSelector='address'></mo-story-custom-address-column>
				${columnsTemplate}
			</mo-data-grid>
		`
	}
}