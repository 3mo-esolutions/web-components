import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './FetchableDataGrid.js'

export default {
	title: 'Fetchable Data Grid',
	component: 'mo-fetchable-data-grid',
	package: p,
} as Meta

type Person = { id: number, name: string, age: number, city: string }

const generatePeople = (count: number) => {
	const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt']
	const names = ['Max', 'Moritz', 'Mia', 'Maja', 'Mika']
	return new Array(count).fill(0).map((_, i) => ({
		id: i + 1,
		name: names[Math.floor(Math.random() * names.length)],
		age: Math.floor(Math.random() * 80),
		city: cities[Math.floor(Math.random() * cities.length)]
	})) as Array<Person>
}

const twentyPeople = generatePeople(20)

const columnsTemplate = html`
	<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='Name' width='200px' dataSelector='name'></mo-data-grid-column-text>
	<mo-data-grid-column-number .nonEditable=${(person: Person) => person.age > 30} heading='Age' dataSelector='age'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
`

const fetchData = (data: Array<Person>) => async () => {
	await new Promise(resolve => setTimeout(resolve, 2000))
	return data
}

export const FetchableDataGrid: StoryObj = {
	render: () => html`
		<mo-fetchable-data-grid .parameters=${{}} .fetch=${fetchData(twentyPeople)} style='height: 500px; flex: 1'>
			${columnsTemplate}
		</mo-fetchable-data-grid>
	`
}

export const AutoRefetch: StoryObj = {
	render: () => html`
		<mo-fetchable-data-grid .parameters=${{}} .fetch=${fetchData(twentyPeople)} autoRefetch='5' style='height: 500px; flex: 1'>
			${columnsTemplate}
			<span slot='toolbar'>Auto refetch every 5 seconds</span>
		</mo-fetchable-data-grid>
	`
}

export const NoFilters: StoryObj = {
	render: () => html`
		<mo-fetchable-data-grid .fetch=${fetchData(twentyPeople)} style='height: 500px; flex: 1'>
			${columnsTemplate}
		</mo-fetchable-data-grid>
	`
}