import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style, type HTMLTemplateResult } from '@a11d/lit'
import p from './package.json'
import { DataGridEditability, DataGridSelectionBehaviorOnDataChange, DataGridSelectability, DataGridSortingStrategy, DataGridColumnText, type DataGridColumnMenuItems, type DataGridReorderChange } from './index.js'
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