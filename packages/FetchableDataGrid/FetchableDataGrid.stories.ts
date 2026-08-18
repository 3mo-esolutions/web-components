import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './FetchableDataGrid.js'

export default {
	title: 'Data Display / Fetchable Data Grid',
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
const twoHundredPeople = generatePeople(200)
const thousandPeople = generatePeople(1000)

const wait = (ms = 1200) => new Promise(r => setTimeout(r, ms))

const columnsTemplate = html`
	<mo-data-grid-column-number hidden nonEditable heading='ID' dataSelector='id'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='Name' width='200px' dataSelector='name'></mo-data-grid-column-text>
	<mo-data-grid-column-number .nonEditable=${(person: Person) => person.age > 30} heading='Age' dataSelector='age'></mo-data-grid-column-number>
	<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
`

const fetchData = (data: Array<Person>) => async () => {
	await wait()
	return data
}

export const FetchableDataGrid: StoryObj = {
	render: () => html`
		<mo-fetchable-data-grid .parameters=${{}} .fetch=${fetchData(twentyPeople)} style='height: 500px; flex: 1'>
			${columnsTemplate}
		</mo-fetchable-data-grid>
	`
}

const paginationParameters = (p: { page: number, pageSize: number }) => p

const fetchPage = (data: Array<Person>, delay?: number) => async ({ page, pageSize }: { page: number, pageSize: number }) => {
	await wait(delay)
	return {
		data: data.slice((page - 1) * pageSize, page * pageSize),
		dataLength: data.length
	}
}

export const FetchableDataGrid_DataLength: StoryObj = {
	name: 'With Pagination via Fetching Data-length',
	render: () => html`
		<mo-fetchable-data-grid pagination='25' .parameters=${{}} .fetch=${fetchPage(twoHundredPeople)} .paginationParameters=${paginationParameters} style='height: 500px; flex: 1'>
			${columnsTemplate}
		</mo-fetchable-data-grid>
	`
}

export const FetchableDataGrid_HasNextPage: StoryObj = {
	name: 'With pagination via fetching hasNextPage',
	render: () => {
		const fetch = async ({ page, pageSize }: { page: number, pageSize: number }) => {
			await wait()
			return {
				data: twoHundredPeople.slice((page - 1) * pageSize, page * pageSize),
				hasNextPage: page < Math.ceil(twoHundredPeople.length / pageSize)
			}
		}
		return html`
			<mo-fetchable-data-grid pagination='25' .parameters=${{}} .fetch=${fetch} .paginationParameters=${paginationParameters} style='height: 500px; flex: 1'>
				${columnsTemplate}
			</mo-fetchable-data-grid>
		`
	}
}

export const InfiniteScrolling: StoryObj = {
	name: 'With infinite scrolling',
	parameters: {
		docs: {
			description: {
				story: 'Leaving `pagination` unset is the default for server-side pagination. Instead of navigating between pages, the grid streams page after page into the view as the user scrolls towards the end.'
			}
		}
	},
	render: () => html`
		<mo-fetchable-data-grid .parameters=${{}} .fetch=${fetchPage(thousandPeople, 750)} .paginationParameters=${paginationParameters} style='height: 500px; flex: 1'>
			${columnsTemplate}
		</mo-fetchable-data-grid>
	`
}

export const InfiniteScrolling_HasNextPage: StoryObj = {
	name: 'With infinite scrolling via fetching hasNextPage',
	render: () => {
		const fetch = async ({ page, pageSize }: { page: number, pageSize: number }) => {
			await wait(750)
			return {
				data: thousandPeople.slice((page - 1) * pageSize, page * pageSize),
				hasNextPage: page < Math.ceil(thousandPeople.length / pageSize)
			}
		}
		return html`
			<mo-fetchable-data-grid .parameters=${{}} .fetch=${fetch} .paginationParameters=${paginationParameters} style='height: 500px; flex: 1'>
				${columnsTemplate}
			</mo-fetchable-data-grid>
		`
	}
}

export const InfiniteScrolling_Failing: StoryObj = {
	name: 'With infinite scrolling and a failing page',
	parameters: {
		docs: {
			description: {
				story: 'Every third page fails. The stream stops instead of hammering the server and offers to retry.'
			}
		}
	},
	render: () => {
		let attempt = 0
		const fetch = async ({ page, pageSize }: { page: number, pageSize: number }) => {
			await wait(750)
			if (page > 1 && ++attempt % 3 === 0) {
				throw new Error('The page could not be fetched.')
			}
			return {
				data: thousandPeople.slice((page - 1) * pageSize, page * pageSize),
				dataLength: thousandPeople.length
			}
		}
		return html`
			<mo-fetchable-data-grid .parameters=${{}} .fetch=${fetch} .paginationParameters=${paginationParameters} style='height: 500px; flex: 1'>
				${columnsTemplate}
			</mo-fetchable-data-grid>
		`
	}
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