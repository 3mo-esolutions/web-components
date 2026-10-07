import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import { sourceOf } from '../../.storybook/source.js'
import { Person } from '../EntityDialog/stories/Person.js'
import { PersonDialog } from '../EntityDialog/stories/PersonDialog.js'
import personDialogSource from '../EntityDialog/stories/PersonDialog.ts?raw'
import './index.js'

type Args = {
	readonly create?: () => void
	readonly edit?: (person: Person) => void
	readonly delete?: (...people: Array<Person>) => void
}

export default {
	title: 'Data / Data Grids / Entity Data Grid',
	component: 'mo-entity-data-grid',
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	args: {
		create: fn(),
		edit: fn(),
		delete: fn(),
	},
	render: ({ create, edit, delete: remove }) => html`
		<mo-entity-data-grid style='height: 500px' selectability='multiple'
			.parameters=${{}}
			.fetch=${() => new Promise(resolve => setTimeout(() => resolve([
				{ id: 1, name: 'Octavia Blake', age: 34, city: 'Berlin' },
				{ id: 2, name: 'Clarke Griffin', age: 27, city: 'Hamburg' },
				{ id: 3, name: 'Raven Reyes', age: 29, city: 'München' },
				{ id: 4, name: 'Marcus Kane', age: 52, city: 'Frankfurt' },
			]), 1000))}
			.create=${create}
			.edit=${edit}
			.delete=${remove}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-entity-data-grid>
	`,
}

/** `createOrEdit` takes an entity dialog, which the add button opens to create a person and a row's Edit or a double click to edit one; the grid refetches after each. */
export const Dialogs: Story = {
	parameters: sourceOf(personDialogSource),
	render: () => html`
		<mo-entity-data-grid style='height: 500px' selectability='multiple'
			.parameters=${{}}
			.fetch=${Person.getAll}
			.createOrEdit=${PersonDialog}
			.delete=${Person.delete}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-entity-data-grid>
	`,
}

/** `isEntityEditable` and `isEntityDeletable` take Edit and Delete out of the menu of the rows they reject: here people under 21 cannot be edited and people under 25 cannot be deleted. */
export const EditableAndDeletable: Story = {
	render: () => html`
		<mo-entity-data-grid style='height: 500px' selectability='multiple'
			.parameters=${{}}
			.fetch=${Person.getAll}
			.createOrEdit=${PersonDialog}
			.isEntityEditable=${(person: Person) => person.age! >= 21}
			.delete=${Person.delete}
			.isEntityDeletable=${(person: Person) => person.age! >= 25}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-entity-data-grid>
	`,
}

/** `rowContextMenuTemplate` adds items of your own above Edit and Delete. */
export const ContextMenu: Story = {
	render: () => html`
		<mo-entity-data-grid style='height: 500px' selectability='multiple'
			.parameters=${{}}
			.fetch=${Person.getAll}
			.createOrEdit=${PersonDialog}
			.delete=${Person.delete}
			.rowContextMenuTemplate=${() => html`
				<mo-context-menu-item icon='mail'>Send an email</mo-context-menu-item>
				<mo-context-menu-item icon='content_copy'>Duplicate</mo-context-menu-item>
			`}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-entity-data-grid>
	`,
}

/** `createHidden` leaves out the add button while `create` stays available, for a grid whose creation starts elsewhere. */
export const CreateHidden: Story = {
	render: () => html`
		<mo-entity-data-grid style='height: 500px' createHidden
			.parameters=${{}}
			.fetch=${Person.getAll}
			.createOrEdit=${PersonDialog}
		>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='City' dataSelector='city'></mo-data-grid-column-text>
		</mo-entity-data-grid>
	`,
}
