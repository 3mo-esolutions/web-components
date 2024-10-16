import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { DialogDeletion } from './index.js'

export default {
	title: 'Deletion Dialog',
	component: 'mo-dialog-deletion',
	package: p,
} as Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogDeletion({ content: 'Content' }).confirm()}>Open</mo-button>
	`
}

export const Custom: StoryObj = {
	render: () => html`
		<mo-button @click=${handleClick}>Open</mo-button>
	`
}

const handleClick = () => {
	return new DialogDeletion({
		heading: 'Delete this?',
		primaryButtonText: 'Delete irreversibly',
		content(this: DialogDeletion) {
			return html`<mo-field-text required label='Reason'></mo-field-text>`
		},
		async deletionAction(this) {
			const value = this.renderRoot.querySelector('mo-field-text')?.value?.trim()
			if (!value) {
				throw new Error('Reason is required')
			}
			await new Promise(r => setTimeout(r, 1000))
			alert(`Deleted with reason: ${value}`)
		},
	}).confirm()
}