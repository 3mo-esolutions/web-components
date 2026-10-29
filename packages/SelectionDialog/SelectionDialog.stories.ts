import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { DataGridColumnBinder } from '@3mo/data-grid'
import '@3mo/button'
import '@3mo/fetchable-data-grid'
import { hundredPeople, Person } from '../../stories/index.js'
import { SelectionDialog } from './index.js'

export default {
	title: 'Data / Selection Dialog',
	component: 'mo-selection-dialog',
} satisfies Meta

const { bind } = DataGridColumnBinder.for(Person)

const dataGridTemplate = html`
	<mo-fetchable-data-grid .fetch=${() => hundredPeople}>
		<mo-data-grid-column-image ${bind('avatar')} tooltipSelector='name'></mo-data-grid-column-image>
		<mo-data-grid-column-text ${bind('name')}></mo-data-grid-column-text>
		<mo-data-grid-column-text ${bind('occupation')}></mo-data-grid-column-text>
		<mo-data-grid-column-text ${bind('city')}></mo-data-grid-column-text>
	</mo-fetchable-data-grid>
`

/** A click selects a row, the primary button or a row's context menu confirms, and the heading names the `@label` of the data type. */
export const Default: StoryObj = {
	render: () => html`
		<mo-button type='outlined' @click=${() => new SelectionDialog<Person>({ data: Person, dataGridTemplate }).confirm()}>
			Select a person
		</mo-button>
	`,
}

/** `multipleSelection` confirms with every selected entry. */
export const MultipleSelection: StoryObj = {
	render: () => html`
		<mo-button type='outlined' @click=${() => new SelectionDialog<Person, true>({ data: Person, dataGridTemplate, multipleSelection: true, primaryButtonText: 'Invite' }).confirm()}>
			Invite people
		</mo-button>
	`,
}
