import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly value: string
	readonly required: boolean
	readonly disabled: boolean
	readonly readonly: boolean
}

export default {
	title: 'Inputs / Text Fields / Text Area',
	component: 'mo-field-text-area',
	args: {
		label: 'Message',
		value: 'Hey there!',
		required: false,
		disabled: false,
		readonly: false,
	},
	decorators: [story => html`<mo-flex gap='1rem' alignItems='flex-start'>${story()}</mo-flex>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, value, required, disabled, readonly }) => html`
		<mo-field-text-area label=${label} value=${value} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></mo-field-text-area>
	`,
}

/** `start` and `end` hold buttons beside the text. */
export const Slots: Story = {
	render: () => html`
		<mo-field-text-area label='Message' value='Hey there!'>
			<mo-icon-button dense slot='start' icon='sentiment_satisfied_alt'></mo-icon-button>
			<mo-icon-button dense slot='end' icon='send'></mo-icon-button>
		</mo-field-text-area>
	`,
}

/** `maxLength` counts down the characters left. */
export const Length: Story = {
	render: () => html`<mo-field-text-area label='Bio' maxLength='160' value='Writes web components.'></mo-field-text-area>`,
}

/** The field grows with its text from two lines on. A `min-height` on the element makes it start higher, and a `max-height` on the `input` part makes it scroll - type past eight lines. */
export const Height: Story = {
	render: () => html`
		<style>
			#notes {
				min-height: 8rem;
			}

			#notes::part(input) {
				max-height: 8lh;
			}
		</style>
		<mo-field-text-area id='notes' label='Notes'></mo-field-text-area>
	`,
}
