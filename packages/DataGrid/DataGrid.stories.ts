import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

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

const people: Array<Person> = [
	{ id: 1, name: 'Max', age: 20, city: 'Berlin' },
	{ id: 2, name: 'Moritz', age: 30, city: 'Hamburg' },
	{ id: 3, name: 'Mia', age: 40, city: 'München' },
	{ id: 4, name: 'Maja', age: 50, city: 'Köln' },
	{ id: 5, name: 'Mika', age: 60, city: 'Frankfurt' },
]

export const DataGrid = story({
	render: () => html`
		<mo-data-grid .data=${people} style='height: 500px'>
			<mo-data-grid-column-number hidden heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-data-grid>
	`
})

export const ContextMenu = story({
	render: () => html`
		<mo-data-grid .data=${people} style='height: 500px' selectionMode='multiple' .getRowContextMenuTemplate=${() => html`
			<mo-context-menu-item>Item1</mo-context-menu-item>
			<mo-context-menu-item>Item2</mo-context-menu-item>
		`}>
			<mo-data-grid-column-number hidden heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-data-grid>
	`
})