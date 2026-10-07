import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import { GenericEntityDialog } from './index.js'
import { Person } from './stories/Person.js'
import { PersonDialog } from './stories/PersonDialog.js'
import personDialogSource from './stories/PersonDialog.ts?raw'

export default {
	title: 'Data / Entity Dialog',
	component: 'mo-entity-dialog',
} satisfies Meta

export const Default: StoryObj = {
	parameters: sourceOf(personDialogSource),
	render: () => html`
		<mo-button @click=${() => new PersonDialog({ id: 1 }).confirm()}>Edit person</mo-button>
	`,
}

/** Without an `id` the dialog creates a person, fetching nothing and offering no Delete. Ctrl+S saves too, and the notification after a save opens the person again. */
export const Create: StoryObj = {
	parameters: sourceOf(personDialogSource),
	render: () => html`
		<mo-button @click=${() => new PersonDialog({}).confirm()}>Create person</mo-button>
	`,
}

/** `GenericEntityDialog` takes the entity, `fetch`, `save`, `delete` and its content as parameters, for a dialog without a class of its own. */
export const Generic: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new GenericEntityDialog<Person>({
			id: 2,
			entity: new Person(),
			fetch: Person.get,
			save: Person.save,
			delete: Person.delete,
			content(this) {
				const { bind } = this.entityBinder
				return html`
					<mo-flex gap='16px' style='width: 320px'>
						<mo-field-text label='Name' required ${bind('name')}></mo-field-text>
						<mo-field-number label='Age' ${bind('age')}></mo-field-number>
					</mo-flex>
				`
			},
		}).confirm()}>Edit person</mo-button>
	`,
}
