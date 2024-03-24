import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Entity Data Grid',
	component: 'mo-entity-data-grid',
	package: p,
} as Meta

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

type Person = { id: number, name: string, age: number, city: string }

type Parameters = { count: number }

const fetch = async (parameters: Parameters) => {
	await new Promise(resolve => setTimeout(resolve, 1000))
	return generatePeople(parameters.count)
}

const parameters = { count: 50 }

export const EntityDataGrid: StoryObj = {
	render: () => html`
		<p>
			In this demo the people below 7 years old are not editable and the people below 18 years old are not deletable.
		</p>
		<mo-entity-data-grid style='height: 500px' selectionMode='multiple'
			.fetch=${fetch}
			.parameters=${parameters}
			.create=${() => alert('Create')}
			.edit=${(person: Person) => alert(`Edit ${person.name}`)}
			.isEntityEditable=${(person: Person) => person.age > 7}
			.delete=${(...people: Array<Person>) => alert(`Delete ${people.map(person => person.name).join(', ')}`)}
			.isEntityDeletable=${(person: Person) => person.age <= 18}
		>
			<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-entity-data-grid>
	`
}