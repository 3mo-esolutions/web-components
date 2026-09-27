import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { departments, respond, thousandPeople, twentyPeople } from '../../stories/index.js'
import './index.js'

type Args = {
	readonly silentFetch: boolean
	readonly autoRefetch?: number
}

type Page = { readonly page: number, readonly pageSize: number }

export default {
	title: 'Data / Data Grids / Fetchable Data Grid',
	component: 'mo-fetchable-data-grid',
	args: {
		silentFetch: false,
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ silentFetch }) => html`
		<mo-fetchable-data-grid style='height: 500px' ?silentFetch=${silentFetch}
			.parameters=${{}}
			.fetch=${() => new Promise(resolve => setTimeout(() => resolve([
				{ name: 'Octavia Blake', age: 34, city: 'Berlin' },
				{ name: 'Clarke Griffin', age: 27, city: 'Hamburg' },
				{ name: 'Raven Reyes', age: 29, city: 'München' },
				{ name: 'Marcus Kane', age: 52, city: 'Frankfurt' },
			]), 1000))}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-fetchable-data-grid>
	`,
}

/** `fetch` receives the `parameters`, and new parameters fetch again - search for a name. */
export const Parameters: Story = {
	render: () => {
		const [parameters, setParameters] = useState({ search: '' })
		return html`
			<mo-fetchable-data-grid style='height: 500px' .parameters=${parameters}
				.fetch=${({ search }: { search: string }) => respond(twentyPeople.filter(person => person.name.toLowerCase().includes(search.toLowerCase())))}
			>
				<mo-field-search slot='toolbar' .value=${parameters.search} @change=${(event: CustomEvent<string | undefined>) => setParameters({ search: event.detail ?? '' })}></mo-field-search>
				<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
				<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
			</mo-fetchable-data-grid>
		`
	},
}

/** Until `parameters` is set, the grid fetches nothing and asks for a filter selection, which the `error-no-selection` slot replaces. */
export const NoSelection: Story = {
	render: () => html`
		<mo-fetchable-data-grid style='height: 500px' .fetch=${() => respond(twentyPeople)}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-fetchable-data-grid>
	`,
}

/** `paginationParameters` turns a page into parameters, and `fetch` returns that page with the `dataLength` of all rows; with a `pagination`, the footer navigates the pages. */
export const Pagination: Story = {
	render: () => html`
		<mo-fetchable-data-grid style='height: 500px' pagination='25'
			.parameters=${{}}
			.paginationParameters=${({ page, pageSize }: Page) => ({ page, pageSize })}
			.fetch=${({ page, pageSize }: Page) => respond({ data: thousandPeople.slice((page - 1) * pageSize, page * pageSize), dataLength: thousandPeople.length })}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-fetchable-data-grid>
	`,
}

/** A server that cannot count its rows returns whether another page follows, `hasNextPage`, instead of `dataLength`. */
export const PaginationWithHasNextPage: Story = {
	render: () => html`
		<mo-fetchable-data-grid style='height: 500px' pagination='25'
			.parameters=${{}}
			.paginationParameters=${({ page, pageSize }: Page) => ({ page, pageSize })}
			.fetch=${async ({ page, pageSize }: Page) => {
				const data = await respond(thousandPeople.slice((page - 1) * pageSize, page * pageSize))
				return { data, hasNextPage: page * pageSize < thousandPeople.length }
			}}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-fetchable-data-grid>
	`,
}

/** Without a `pagination`, the pages stream in one after another as the grid is scrolled to its end. */
export const InfiniteScrolling: Story = {
	render: () => html`
		<mo-fetchable-data-grid style='height: 500px'
			.parameters=${{}}
			.paginationParameters=${({ page, pageSize }: Page) => ({ page, pageSize })}
			.fetch=${({ page, pageSize }: Page) => respond({ data: thousandPeople.slice((page - 1) * pageSize, page * pageSize), dataLength: thousandPeople.length })}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-fetchable-data-grid>
	`,
}

/** With `hasNextPage`, the stream stops at the first page that has none after it. */
export const InfiniteScrollingWithHasNextPage: Story = {
	render: () => html`
		<mo-fetchable-data-grid style='height: 500px'
			.parameters=${{}}
			.paginationParameters=${({ page, pageSize }: Page) => ({ page, pageSize })}
			.fetch=${async ({ page, pageSize }: Page) => {
				const data = await respond(thousandPeople.slice((page - 1) * pageSize, page * pageSize))
				return { data, hasNextPage: page * pageSize < thousandPeople.length }
			}}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-fetchable-data-grid>
	`,
}

/** Every third page fails: the stream stops instead of retrying on its own, and the `infinite-scroll-indicator` part offers a retry button. */
export const FailingPage: Story = {
	render: () => {
		let requests = 0
		return html`
			<mo-fetchable-data-grid style='height: 500px'
				.parameters=${{}}
				.paginationParameters=${({ page, pageSize }: Page) => ({ page, pageSize })}
				.fetch=${async ({ page, pageSize }: Page) => {
					const data = await respond(thousandPeople.slice((page - 1) * pageSize, page * pageSize))
					if (page > 1 && ++requests % 3 === 0) {
						throw new Error('The page could not be fetched.')
					}
					return { data, dataLength: thousandPeople.length }
				}}
			>
				<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
				<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
				<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
			</mo-fetchable-data-grid>
		`
	},
}

/** `autoRefetch` fetches again every 5 seconds here; the refetch button in the toolbar fetches at once, and a right click on it changes the interval. */
export const AutoRefetch: Story = {
	render: () => html`
		<mo-fetchable-data-grid style='height: 500px' autoRefetch='5' .parameters=${{}} .fetch=${() => respond(twentyPeople)}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-fetchable-data-grid>
	`,
}

/** `silentFetch` keeps the rows while a fetch runs instead of showing a spinner, and open sub rows stay open: open a department and a team, then wait for the refetch. */
export const SilentFetch: Story = {
	args: {
		silentFetch: true,
		autoRefetch: 5,
	},
	argTypes: {
		autoRefetch: { control: { type: 'number', min: 0 } },
	},
	render: ({ silentFetch, autoRefetch }) => html`
		<mo-fetchable-data-grid style='height: 500px' subDataGridDataSelector='teams' multipleDetails
			?silentFetch=${silentFetch}
			autoRefetch=${autoRefetch || undefined}
			.parameters=${{}}
			.fetch=${() => respond(structuredClone(departments))}
		>
			<mo-data-grid-column-text heading='Department' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Headcount' dataSelector='headcount'></mo-data-grid-column-number>
		</mo-fetchable-data-grid>
	`,
}