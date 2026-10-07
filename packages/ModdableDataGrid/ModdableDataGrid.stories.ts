import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import { InMemoryModesAdapter } from './stories/InMemoryModesAdapter.js'
import { archivedViews, views } from './stories/views.js'
import peopleDataGridSource from './stories/PeopleDataGrid.ts?raw'
import inMemoryModesAdapterSource from './stories/InMemoryModesAdapter.ts?raw'
import './stories/PeopleDataGrid.js'

export default {
	title: 'Data / Data Grids / Moddable Data Grid',
} satisfies Meta

/** Pick a view in the bar above the grid and change its filters, sorting or columns: its chip then offers to save or discard the changes, and the add button saves them as a new view. */
export const Default: StoryObj = {
	parameters: sourceOf(peopleDataGridSource),
	render: () => html`
		<story-people-data-grid style='height: 540px' .modesAdapter=${new InMemoryModesAdapter(views())}></story-people-data-grid>
	`,
}

/** A `modesAdapter` keeps the views, here in memory and none to begin with: the bar stays hidden and the add button sits among the toolbar's actions until the first view is saved. */
export const NoViews: StoryObj = {
	parameters: sourceOf(inMemoryModesAdapterSource),
	render: () => html`
		<story-people-data-grid style='height: 540px' .modesAdapter=${new InMemoryModesAdapter()}></story-people-data-grid>
	`,
}

/** Archived views leave the bar for the archive menu at its end, where they are applied, pinned back, edited or deleted. */
export const ArchivedViews: StoryObj = {
	render: () => html`
		<story-people-data-grid style='height: 540px' .modesAdapter=${new InMemoryModesAdapter([...views(), ...archivedViews()])}></story-people-data-grid>
	`,
}

/** Without a `modesAdapter`, the views are kept in IndexedDB under the grid's tag, so they survive a reload. */
export const IndexedDb: StoryObj = {
	render: () => html`
		<story-people-data-grid style='height: 540px'></story-people-data-grid>
	`,
}
