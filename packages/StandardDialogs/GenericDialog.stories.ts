import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import { GenericDialog } from './index.js'

type Args = {
	readonly onResult?: (result: string) => void
}

export default {
	title: 'Feedback / Standard Dialogs / Generic Dialog',
	component: 'mo-generic-dialog',
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: () => html`
		<mo-button @click=${() => new GenericDialog({ heading: 'Archive the order?', content: 'Archived orders are hidden from the list.' }).confirm()}>Archive</mo-button>
	`,
}

/** `primaryAction` and `secondaryAction` return what `confirm()` resolves to - see the Actions panel. Closing the dialog rejects it. */
export const Actions: Story = {
	args: {
		onResult: fn(),
	},
	render: ({ onResult }) => html`
		<mo-button @click=${async () => onResult?.(await new GenericDialog<string>({
			heading: 'Leave the page?',
			content: 'The changes made to this order are not saved yet.',
			primaryButtonText: 'Save and leave',
			secondaryButtonText: 'Discard',
			primaryAction: () => 'saved',
			secondaryAction: () => 'discarded',
		}).confirm())}>Leave</mo-button>
	`,
}