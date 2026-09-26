import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, ref, state, style, type HTMLTemplateResult } from '@a11d/lit'
import { observeResize } from '@3mo/resize-observer'
import p from './package.json'
import { DataGridColumn, DataGridController, DataGridEditability, DataGridSelectionBehaviorOnDataChange, DataGridSelectability, DataGridSortingStrategy, DataGridColumnText, type DataGridColumnMenuItems, type DataGridReorderChange, type DataRecord } from './index.js'
import { DialogAlert } from '../StandardDialogs/index.js'

export default {
	title: 'Data Display / Data Grid',
	component: 'mo-data-grid',
	argTypes: {
		headerHidden: { control: 'boolean' },
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
		hasAlternatingBackground: { control: 'boolean' },
		exportable: { control: 'boolean' }
	},
	package: p,
} as Meta

type Generation = 'any' | 'adult' | 'young'

class Person {
	private static readonly firstNames = [
		'Octavia', 'Bellamy', 'Clarke', 'Raven', 'Murphy', 'Lexa', 'Indra', 'Echo', 'Madi', 'Charmaine',
		'Elliot', 'Darlene', 'Angela', 'Tyrell', 'Dominique', 'Arya', 'Sansa', 'Brienne', 'Davos', 'Tormund',
		'Max', 'Chloe', 'Warren', 'Victoria', 'Malcolm', 'Zoe', 'Kaylee', 'Inara', 'River', 'Jean-Luc',
		'Beverly', 'Geordi', 'Deanna', 'Kiki', 'Sophie', 'Howl', 'Chihiro', 'Ashitaka', 'Nausicaä', 'Ursula',
		'Esmeralda', 'Rincewind', 'Tiffany', 'Moist',
	]

	private static readonly lastNames = [
		'Blake', 'Griffin', 'Reyes', 'Woods', 'Kane', 'Diyoza', 'Alderson', 'Wellick', 'Moss', 'Stark',
		'Tarth', 'Seaworth', 'Giantsbane', 'Caulfield', 'Price', 'Marsh', 'Graham', 'Chase', 'Reynolds', 'Washburne',
		'Frye', 'Serra', 'Tam', 'Picard', 'Crusher', 'Laforge', 'Troi', 'Rozhenko', 'Ogino', 'Hayashi',
		'Kusanagi', 'Okonkwo', 'Weatherwax', 'Lipwig', 'Vimes',
	]

	private static readonly locations = [
		['Elm Street', '62701 Springfield, USA'],
		['Rue des Lilas', '75011 Paris, France'],
		['Bahnhofstraße', '10119 Berlin, Deutschland'],
		['Baker Street', 'NW1 6XE London, England'],
		['Vasagatan', '111 20 Stockholm, Sverige'],
		['Prinsengracht', '1015 Amsterdam, Nederland'],
		['Gran Vía', '28013 Madrid, España'],
		['Via del Corso', '00186 Roma, Italia'],
		['Nyhavn', '1051 København, Danmark'],
		['Kärntner Straße', '1010 Wien, Österreich'],
		['Sannomiya-dori', '650-0021 Kōbe, Japan'],
		['Balogun Street', '101241 Lagos, Nigeria'],
		['Queen Street West', 'M5V 2T6 Toronto, Canada'],
		['Flinders Lane', '3000 Melbourne, Australia'],
	] as ReadonlyArray<readonly [street: string, city: string]>

	private static readonly agesByGeneration: Record<Generation, Array<number>> = {
		any: [16, 27, 34, 52, 71, 13, 45, 22, 39, 61, 17, 30, 44, 25, 58, 68, 19, 36, 48, 23],
		adult: [34, 41, 52, 38, 46, 61, 44, 57, 49, 36],
		young: [16, 13, 21, 8, 17, 11, 19, 6, 22, 14],
	}

	private static count = 0

	/**
	 * Every person is an instance of its own, as a grid keys selection and details by identity: the same object
	 * in two rows would select and expand both of them at once. Generate into a constant rather than into a
	 * template, so that a re-render does not hand the grid new identities either.
	 */
	static generate(count: number, generation: Generation = 'any') {
		return Array.from({ length: count }, () => Person.next(generation))
	}

	/** Three generations of distinct people, for the sub-row and export demos. */
	static generateFamilies(count: number) {
		return Array.from({ length: count }, (_, family) => Person.next('adult',
			Array.from({ length: 2 + family % 2 }, (_, child) => Person.next('young', Person.generate(child % 3, 'young')))
		))
	}

	/** A page of parents with many children each — a products page whose rows all open into their variants. */
	static generateLargeFamilies(count: number, childrenPerFamily: number) {
		return Array.from({ length: count }, () => Person.next('adult', Person.generate(childrenPerFamily, 'young')))
	}

	private static next(generation: Generation, children?: Array<Person>) {
		const index = Person.count++
		const ages = Person.agesByGeneration[generation]
		const age = ages[index % ages.length]!
		return new Person({
			id: 1001 + index,
			name: `${Person.firstNames[index % Person.firstNames.length]} ${Person.lastNames[index % Person.lastNames.length]}`,
			birthDate: Person.birthDate(age, index * 53 % 360),
			address: Person.address(index),
			balance: index % 7 === 3 ? 0 : (index * 137 % 41 - 12) * 75,
			children,
		})
	}

	private static address(index: number) {
		const [street, city] = Person.locations[index * 5 % Person.locations.length]!
		return `${1 + index * 37 % 240} ${street}, ${city}`
	}

	private static birthDate(yearsAgo: number, daysAgo: number) {
		const date = new Date()
		date.setFullYear(date.getFullYear() - yearsAgo)
		date.setDate(date.getDate() - daysAgo)
		return new DateTime(date.toISOString().slice(0, 10))
	}

	readonly id!: number
	readonly name!: string
	readonly birthDate!: DateTime
	readonly address!: string
	readonly children?: Array<Person>
	readonly balance!: number

	constructor(init?: Partial<Person>) {
		Object.assign(this, init)
	}

	get age() {
		return Math.floor((new DateTime().since(this.birthDate).years))
	}
}

const fivePeople = Person.generate(5)
const twentyPeople = Person.generate(20)
const fiftyPeople = Person.generate(50)
const hundredPeople = Person.generate(100)
const thousandPeople = Person.generate(1000)
const fiveFamilies = Person.generateFamilies(5)
const twentyFiveLargeFamilies = Person.generateLargeFamilies(25, 40)

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

export const Filters: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Elements slotted into the "filter" slot are toggled through the filter icon-button in the toolbar. They continue the toolbar\'s row when they all fit into its remaining space, and wrap into rows of their own otherwise - as in the second data grid below.'
			},
		}
	},
	render: () => html`
		<mo-data-grid .data=${twentyPeople} style='height: 300px'>
			${columnsTemplate}
			<mo-field-search slot='toolbar'></mo-field-search>
			<mo-field-select label='Name' slot='filter'>
				${[...new Set(twentyPeople.map(p => p.name))].map(name => html`<mo-option value=${name}>${name}</mo-option>`)}
			</mo-field-select>
			<mo-field-date-range label='Birth Date' slot='filter'></mo-field-date-range>
			<mo-checkbox label='Positive balances only' slot='filter'></mo-checkbox>
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
			.data=${fiftyPeople}
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

export const Reorderability: StoryObj = {
	render: () => html`
		<mo-data-grid .data=${hundredPeople} pagination='auto' style='height: 500px' reorderability
			@reorder=${(e: CustomEvent<Array<DataGridReorderChange<Person>>>) => alert(e.detail.map(x => `${x.record.data.name}: [${x.type}] ${x.oldIndex} -> ${x.record.index}`).join('\n'))}>
			<mo-data-grid-column-number sticky='start' nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' sumHeading='Ages Total'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Address' dataSelector='address'></mo-data-grid-column-text>
			<mo-data-grid-column-currency heading='Balance' dataSelector='balance' sumHeading='Balances Total'></mo-data-grid-column-currency>
		</mo-data-grid>
	`
}

export const WithDetails: StoryObj = {
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

export const Details_SubDataGrid: StoryObj = {
	name: 'Details - Sub Data Grid',
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid style='height: 500px'
			.data=${fiveFamilies}
			selectability='multiple'
			?multipleDetails=${multipleDetails}
			?detailsOnClick=${detailsOnClick}
			.getRowDetailsTemplate=${(p: Person) => html`
				<mo-data-grid .data=${p.children}>
					${columnsTemplate}
				</mo-data-grid>
			`}
		>
			${columnsTemplate}
		</mo-data-grid>
	`
}

export const Details_SubRows: StoryObj = {
	name: 'Details - Sub Rows',
	args: {
		multipleDetails: false,
		detailsOnClick: false,
	},
	render: ({ multipleDetails, detailsOnClick }) => html`
		<mo-data-grid style='height: 500px'
			selectability='multiple'
			?multipleDetails=${multipleDetails}
			?detailsOnClick=${detailsOnClick}
			.data=${fiveFamilies}
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

export const Virtualization: StoryObj = {
	render: () => html`
		<mo-flex gap='10px'>
			<mo-data-grid exportable .data=${thousandPeople} selectability='multiple' style='height: 500px' pagination='100000'>
				${columnsTemplate}
			</mo-data-grid>
		</mo-flex>
	`
}

export const Virtualization_SubRows: StoryObj = {
	name: 'Virtualization - Sub Rows',
	render: () => html`
		<mo-flex gap='10px'>
			<div>
				A page of 25 rows which all open into 40 sub rows each — the shape of a products page with every product's variants expanded.
				Scroll through it and watch the scrollbar and the rows around the viewport.
			</div>
			<mo-data-grid style='height: 500px'
				selectability='multiple'
				multipleDetails
				detailsOnClick
				subDataGridDataSelector='children'
				.data=${twentyFiveLargeFamilies}
				.getRowContextMenuTemplate=${() => html`
					<mo-context-menu-item icon='edit'>Edit</mo-context-menu-item>
				`}
				${ref(element => (element as HTMLElementTagNameMap['mo-data-grid'] | undefined)?.openRowDetails())}
			>
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

export const PrimaryAction: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'The element slotted into the "primary-action" slot is displayed at the very end of the toolbar, after the other action icon-buttons.'
			},
		}
	},
	render: () => html`
		<mo-data-grid .data=${hundredPeople} style='height: 500px'>
			${columnsTemplate}
			<mo-field-search slot='toolbar'></mo-field-search>
			<mo-field-select label='Name' slot='filter'></mo-field-select>
			<mo-loading-button slot='primary-action' type='filled' startIcon='add'>Create</mo-loading-button>
		</mo-data-grid>
	`
}

export const PrimaryActionWithSplitButton: StoryObj = {
	args: {
		label: 'Create',
	},
	parameters: {
		docs: {
			description: {
				story: 'The "primary-action" slot can also host composite actions such as a split button.'
			},
		}
	},
	render: ({ label }) => html`
		<mo-data-grid .data=${hundredPeople} style='height: 500px'>
			${columnsTemplate}
			<mo-field-search slot='toolbar'></mo-field-search>
			<mo-field-select label='Name' slot='filter'></mo-field-select>
			<mo-split-button slot='primary-action'>
				<mo-loading-button startIcon='add'>${label}</mo-loading-button>
				<mo-menu-item slot='more' icon='upload'>Import</mo-menu-item>
			</mo-split-button>
		</mo-data-grid>
	`
}

export const Exportable: StoryObj = {
	render: () => html`
		<mo-data-grid exportable subDataGridDataSelector='children' pagination='auto' .data=${fiveFamilies} style='height: 500px'>
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


export const CustomMenuItems: StoryObj = {
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

export const CustomCellStyle: StoryObj = {
	render: () => html`
		<mo-data-grid .data=${twentyPeople} style='height: 500px'>
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
	`
}

type Employee = { id: number, name: string, city: string, age: number, role: string, email: string, reports?: Array<Employee> }

const employee = (id: number, name: string, city: string, age: number, role: string, reports?: Array<Employee>): Employee =>
	({ id, name, city, age, role, email: `${name.split(' ')[0]!.toLowerCase()}@example.com`, reports })

const roles = ['Head of Operations', 'Team Lead', 'Engineer', 'Trainee', 'Security', 'Analyst', 'Courier', 'Photographer', 'Designer']

const employees: Array<Employee> = [
	employee(1, 'Octavia Blake', 'Berlin', 41, 'Head of Operations', [
		employee(11, 'Clarke Griffin', 'Berlin', 32, 'Team Lead', [
			employee(111, 'Wells Jaha', 'Berlin', 27, 'Engineer'),
			employee(112, 'Jasper Jordan', 'Potsdam', 25, 'Trainee'),
		]),
		employee(12, 'Raven Reyes', 'Hamburg', 29, 'Engineer', [employee(121, 'Monty Green', 'Hamburg', 24, 'Trainee')]),
	]),
	employee(2, 'Elliot Alderson', 'Paris', 35, 'Security', [
		employee(21, 'Darlene Alderson', 'Paris', 31, 'Analyst'),
		employee(22, 'Angela Moss', 'Lyon', 33, 'Analyst'),
	]),
	employee(3, 'Arya Stark', 'London', 22, 'Courier'),
	employee(4, 'Max Caulfield', 'Paris', 19, 'Photographer'),
	employee(5, 'Chloe Price', 'Madrid', 20, 'Designer'),
	employee(6, 'Brienne Tarth', 'Dublin', 38, 'Security'),
]

type EditableKey = 'city' | 'age' | 'role'

@component('story-custom-data-grid')
class StoryCustomDataGrid extends Component {
	@state() data = employees
	@state() selection = new Array<Employee>()
	@state() status = ''
	@state() tree = false
	@state() reorderRows = true
	@state() selectability: DataGridSelectability | undefined = DataGridSelectability.Multiple
	@state() editability = DataGridEditability.Cell

	readonly grid = new DataGridController<Employee, StoryCustomDataGrid>(this, host => ({
		get data() { return host.data },
		columns: [
			StoryCustomDataGrid.column({ heading: 'Name', dataSelector: 'name', sticky: 'start' }),
			host.editableColumn('City', 'city', value => html`<input autofocus .value=${value}>`),
			host.editableColumn('Age', 'age', value => html`<input autofocus type='number' min='0' .value=${String(value)}>`, 'end'),
			host.editableColumn('Role', 'role', value => html`
				<select autofocus>${roles.map(role => html`<option ?selected=${role === value}>${role}</option>`)}</select>
			`),
			StoryCustomDataGrid.column({ heading: 'Email', dataSelector: 'email' }),
		],
		get subDataGridDataSelector() { return host.tree ? 'reports' as const : undefined },
		get selectability() { return host.selectability },
		get selectedData() { return host.selection },
		handleSelectionChange: selection => host.selection = selection,
		isDataSelectable: data => data.role !== 'Trainee',
		multipleDetails: true,
		get editability() { return host.editability },
		get reorderability() { return host.reorderRows },
		handleReorder: (data, [move]) => {
			host.data = data
			host.status = !move ? '' : `${move.record.data.name} moved to row ${move.record.index + 1}`
		},
		handleCopy: text => host.status = `Copied "${text}"`,
		handleCsv: csv => StoryCustomDataGrid.download(csv),
		handleCsvError: error => host.status = error.message,
	}))

	/** A column of text, which exports as it reads. */
	private static column<TValue>(column: Partial<DataGridColumn<Employee, TValue>>) {
		return new DataGridColumn<Employee, TValue>({
			*generateCsvHeading() { yield column.heading ?? '' },
			*generateCsvValue(value) { yield String(value ?? '') },
			...column,
		})
	}

	private editableColumn<TKey extends EditableKey>(heading: string, dataSelector: TKey, editor: (value: Employee[TKey]) => HTMLTemplateResult, alignment?: 'end') {
		return StoryCustomDataGrid.column<Employee[TKey]>({
			heading, dataSelector, alignment, editable: true,
			getEditContentTemplate: (value, data) => html`
				<span @change=${(event: Event) => this.edit(data, dataSelector, (event.target as HTMLInputElement).value)}>${editor(value)}</span>
			`,
		})
	}

	private edit(data: Employee, key: EditableKey, value: string) {
		Object.assign(data, { [key]: key === 'age' ? Number(value) : value })
		this.status = `${data.name}: ${key} is now ${value}`
		this.grid.records.invalidate()
	}

	private static download(csv: string) {
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
		const anchor = Object.assign(document.createElement('a'), { href: url, download: 'employees.csv' })
		anchor.click()
		URL.revokeObjectURL(url)
	}

	/** The host measures what it renders beside the columns; the controller stacks the sticky columns behind it. */
	private measure(column: 'reordering' | 'selection') {
		return observeResize(([entry]) => this.grid.columns.setColumnWidth(column, entry?.borderBoxSize[0]?.inlineSize ?? 0))
	}

	/** The roots, and the sub records of every open record. */
	private get visibleRecords() {
		const { records, details } = this.grid
		return records.records.filter(record => record.node?.ancestors.every(ancestor => details.isOpen(records.recordOf(ancestor))) ?? true)
	}

	private get rowReorderingHint() {
		const { reorderability, sorting } = this.grid
		return !this.reorderRows || reorderability.enabled ? ''
			: !reorderability.visible ? 'Rows reorder only while they have no sub rows.'
				: sorting.enabled ? 'Rows reorder only while nothing is sorted.' : ''
	}

	private setSelectability(value: string) {
		this.selectability = !value ? undefined : value as DataGridSelectability
		this.selection = []
	}

	private handleRowKeyDown(event: KeyboardEvent, record: DataRecord<Employee>) {
		if (event.key === ' ' && !(event.target as Element).closest('input, select')) {
			event.preventDefault()
			this.grid.selection.select(record.data, { event })
		}
	}

	private handleNameKeyDown(event: KeyboardEvent, record: DataRecord<Employee>) {
		if (event.key === 'Enter' && record.hasSubData) {
			event.preventDefault()
			this.grid.details.toggle(record)
		}
	}

	static override get styles() {
		return css`
			:host { display: block; color: CanvasText; }
			fieldset { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 1rem; margin-block-end: 0.5rem; }
			.hint { color: color-mix(in srgb, CanvasText 60%, Canvas); }
			.scroller { overflow: auto; max-inline-size: 42rem; max-block-size: 18rem; margin-block: 0.5rem; }
			table { inline-size: max-content; border-collapse: separate; border-spacing: 0; background: Canvas; }
			th, td { box-sizing: border-box; padding: 2px 6px; white-space: nowrap; overflow: hidden; text-align: start; border: solid color-mix(in srgb, CanvasText 15%, transparent); border-width: 0 1px 1px 0; background: Canvas; }
			th { position: sticky; top: 0; z-index: 4; user-select: none; background: color-mix(in srgb, CanvasText 6%, Canvas); font-weight: 500; }
			[data-sticky], .select, .grip { position: sticky; inset-inline-start: 0; z-index: 1; }
			th[data-sticky], th.select, th.grip { z-index: 5; }
			[data-alignment=end] { text-align: end; }
			th[data-reorderability=drop-before] { border-inline-start: 2px solid Highlight; }
			th[data-reorderability=drop-after] { border-inline-end: 2px solid Highlight; }
			.resizer { position: absolute; inset-block: 0; inset-inline-end: 0; inline-size: 5px; cursor: col-resize; }
			.resizer[data-resizing]::after { content: ''; position: fixed; inset-block: 0; inset-inline-start: var(--mo-data-grid-column-resizer-pointer); border-inline-start: 1px dotted; }
			tr[aria-selected=true] td { background: color-mix(in srgb, Highlight 18%, Canvas); }
			:host([data-reordering]) { user-select: none; }
			:host([data-reordering]) tbody tr:not([data-reorderability=dragging]) { transition: transform 0.15s ease; }
			tr[data-reorderability=dragging] { position: relative; z-index: 3; }
			tr[data-reorderability=dragging] td { background: color-mix(in srgb, Highlight 10%, Canvas); }
			.select, .grip { inline-size: 1.75rem; min-inline-size: 1.75rem; padding: 0; text-align: center; }
			.select label { position: absolute; inset: 0; display: grid; place-items: center; cursor: pointer; }
			.select input { margin: 0; }
			.grip { color: color-mix(in srgb, CanvasText 50%, Canvas); }
			table[data-reorderable-rows] td.grip { cursor: grab; }
			th:not(.select, .grip) { cursor: default; }
			th:not(.select, .grip):hover { background: color-mix(in srgb, CanvasText 10%, Canvas); }
			.expander { display: inline-block; inline-size: 1.25rem; padding: 0; border: none; background: none; color: inherit; font: inherit; cursor: pointer; }
		`
	}

	protected override get template() {
		const { grid } = this
		return html`
			${this.featuresTemplate}
			<fieldset>
				<legend>Columns</legend>
				${[...grid.columns.columns].map(column => html`
					<label>
						<input type='checkbox' .checked=${!column.hidden} ?disabled=${column.dataSelector === 'name'}
							@change=${(event: Event) => column.modify({ hidden: !(event.target as HTMLInputElement).checked })}
						>
						${column.heading}
					</label>
				`)}
			</fieldset>
			<div class='scroller'>
				<table ${grid.root.ref()} ?data-reorderable-rows=${grid.reorderability.enabled}>
					<thead>${this.headerTemplate}</thead>
					<tbody>
						${this.visibleRecords.map(record => this.getRowTemplate(record))}
					</tbody>
				</table>
			</div>
			<p>
				Arrow keys move between cells, Home and End along the row, Ctrl+Home to the first cell, Ctrl+C copies one.
				A click or Space selects, with Ctrl or Shift to add or extend; the checkboxes add and remove, and trainees cannot be selected.
				Enter on a name, or its arrow, opens the reports. Enter or a double click edits a city, an age or a role,
				Escape or a click elsewhere ends it. A click on a heading sorts, Shift adds a column to the sorting;
				dragging a heading moves its column, dragging its edge resizes it, and a double click on the edge fits it.
				Dragging a row moves it, while the rows have no sub rows and nothing is sorted.
			</p>
			<p>Selected: ${this.selection.map(employee => employee.name).join(', ') || 'nobody'}</p>
			<p>${this.status || ' '}</p>
		`
	}

	private get featuresTemplate() {
		const { grid } = this
		return html`
			<fieldset>
				<legend>Features</legend>
				<label>
					<input type='checkbox' .checked=${this.tree} @change=${(event: Event) => this.tree = (event.target as HTMLInputElement).checked}>
					Reports as sub rows
				</label>
				<label>
					<input type='checkbox' .checked=${this.reorderRows} @change=${(event: Event) => this.reorderRows = (event.target as HTMLInputElement).checked}>
					Reorder rows
				</label>
				<label>
					Selection
					<select @change=${(event: Event) => this.setSelectability((event.target as HTMLSelectElement).value)}>
						<option value='' ?selected=${this.selectability === undefined}>None</option>
						<option value=${DataGridSelectability.Single} ?selected=${this.selectability === DataGridSelectability.Single}>Single</option>
						<option value=${DataGridSelectability.Multiple} ?selected=${this.selectability === DataGridSelectability.Multiple}>Multiple</option>
					</select>
				</label>
				<label>
					Editing
					<select @change=${(event: Event) => this.editability = (event.target as HTMLSelectElement).value as DataGridEditability}>
						${[DataGridEditability.Never, DataGridEditability.Cell, DataGridEditability.Always].map(editability => html`
							<option value=${editability} ?selected=${this.editability === editability}>${editability[0]!.toUpperCase()}${editability.slice(1)}</option>
						`)}
					</select>
				</label>
				<button ?disabled=${!this.tree} @click=${() => grid.details.openAll()}>Expand all</button>
				<button ?disabled=${!this.tree} @click=${() => grid.details.closeAll()}>Collapse all</button>
				<button ?disabled=${!grid.sorting.enabled} @click=${() => grid.sorting.reset()}>Clear sorting</button>
				<button ?disabled=${grid.csv.isGenerating} @click=${() => grid.csv.generateCsv()}>Export CSV</button>
				<span class='hint'>${this.rowReorderingHint}</span>
			</fieldset>
		`
	}

	private get headerTemplate() {
		const { grid } = this
		const allState = grid.selection.allState
		return html`
			<tr ${grid.header.ref()}>
				${!grid.reorderability.visible ? html.nothing : html`<th class='grip' aria-label='Reorder' ${this.measure('reordering')}></th>`}
				${!grid.selection.hasSelection ? html.nothing : html`
					<th class='select' ${style({ insetInlineStart: grid.columns.getStickyColumnInsetInline('selection') })} ${this.measure('selection')}>
						${grid.selection.selectability !== DataGridSelectability.Multiple ? html.nothing : html`
							<label>
								<input type='checkbox' aria-label='Select all' .checked=${allState === 'all'} .indeterminate=${allState === 'some'}
									@click=${() => grid.selection.toggleAll()}
								>
							</label>
						`}
					</th>
				`}
				${grid.columns.columns.visible.map(column => html`
					<th ${grid.columnHeader(column)} data-alignment=${column.alignment} ${style(this.widthOf(column))}
						@click=${(event: MouseEvent) => column.toggleSort(undefined, event)}
					>
						${column.heading} ${column.sortingDefinition?.strategy === 'ascending' ? '▴' : column.sortingDefinition ? '▾' : ''}
						<span class='resizer' ${grid.columns.resizer(column)}></span>
					</th>
				`)}
			</tr>
		`
	}

	private getRowTemplate(record: DataRecord<Employee>) {
		const { grid } = this
		return html`
			<tr ${grid.row(record)}
				@mousedown=${(event: MouseEvent) => event.shiftKey && event.preventDefault()}
				@click=${(event: MouseEvent) => grid.selection.select(record.data, { event })}
				@keydown=${(event: KeyboardEvent) => this.handleRowKeyDown(event, record)}
			>
				${!grid.reorderability.visible ? html.nothing : html`<td class='grip' role='gridcell'>⠿</td>`}
				${!grid.selection.hasSelection ? html.nothing : html`
					<td class='select' role='gridcell' ${style({ insetInlineStart: grid.columns.getStickyColumnInsetInline('selection') })}
						@click=${(event: MouseEvent) => event.stopPropagation()}
					>
						<label>
							<input type='checkbox' tabindex='-1' aria-label='Select' .checked=${record.isSelected} ?disabled=${!record.isSelectable}
								@click=${(event: MouseEvent) => grid.selection.select(record.data, { preserve: true, selected: (event.target as HTMLInputElement).checked, event })}
							>
						</label>
					</td>
				`}
				${grid.columns.columns.visible.map((column, index) => this.getCellTemplate(record, column, index === 0))}
			</tr>
		`
	}

	private getCellTemplate(record: DataRecord<Employee>, column: DataGridColumn<Employee>, isFirst: boolean) {
		const value = KeyPath.get(record.data, column.dataSelector)
		return html`
			<td ${this.grid.cell(column)} data-alignment=${column.alignment}
				${style({ ...this.widthOf(column), paddingInlineStart: !isFirst ? undefined : `calc(6px + ${record.level} * 1rem)` })}
				@keydown=${(event: KeyboardEvent) => isFirst && this.handleNameKeyDown(event, record)}
			>
				${!isFirst || !this.tree ? html.nothing : !record.hasSubData ? html`<span class='expander'></span>` : html`
					<button class='expander' tabindex='-1' aria-label='Reports'
						@click=${(event: MouseEvent) => { event.stopPropagation(); this.grid.details.toggle(record) }}
					>${record.detailsOpen ? '▾' : '▸'}</button>
				`}
				${this.grid.editability.isEditingAt(record, column) ? column.getEditContentTemplate?.(value, record.data) : value}
			</td>
		`
	}

	/** A width a column was resized to holds it there, instead of its content. */
	private widthOf(column: DataGridColumn<Employee>) {
		const width = column.width === 'max-content' ? undefined : String(column.width)
		return { width, minWidth: width, maxWidth: width }
	}
}

export const WithController: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: '`DataGridController` carries everything `mo-data-grid` does apart from its design, so that a grid of another design only renders it. Here, a plain `<table>` in the system colors: the controller stamps the roles, the selection, the expansion, the sorting, the one cell in the tab order and where the sticky parts stick; it moves the columns their headers are dragged to and the rows that are dragged, resizes the columns by their handles, says which cell edits and exports the rows as CSV. The features above the table switch its tree, row reordering, selection and editing modes live.'
			}
		}
	},
	render: () => html`<story-custom-data-grid></story-custom-data-grid>`
}

declare global {
	interface HTMLElementTagNameMap {
		'story-custom-data-grid': StoryCustomDataGrid
	}
}