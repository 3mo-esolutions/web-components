import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import { DialogDeletion } from './index.js'

type Args = {
	readonly onDelete?: (reason: string) => void
}

export default {
	title: 'Feedback / Standard Dialogs / Deletion Dialog',
	component: 'mo-dialog-deletion',
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: () => html`
		<mo-button @click=${() => new DialogDeletion({}).confirm()}>Delete</mo-button>
	`,
}

/** `label` names what is deleted, highlighted in the question so it can be double-checked. */
export const Label: Story = {
	render: () => html`
		<mo-button @click=${() => new DialogDeletion({ label: 'order #1234' }).confirm()}>Delete order</mo-button>
	`,
}

/** `deletionAction` runs on confirmation while the button shows it is busy; throwing keeps the dialog open. Leave the reason empty to see it refuse. */
export const DeletionAction: Story = {
	args: {
		onDelete: fn(),
	},
	render: ({ onDelete }) => html`
		<mo-button @click=${() => new DialogDeletion({
			heading: 'Delete this customer?',
			primaryButtonText: 'Delete irreversibly',
			content: () => html`<mo-field-text required label='Reason'></mo-field-text>`,
			async deletionAction() {
				const reason = this.renderRoot.querySelector('mo-field-text')?.value?.trim()
				if (!reason) {
					throw new Error('A reason is required')
				}
				await new Promise(resolve => setTimeout(resolve, 1000))
				onDelete?.(reason)
			},
		}).confirm()}>Delete customer</mo-button>
	`,
}
