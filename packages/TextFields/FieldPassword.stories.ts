import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly value: string
	readonly reveal: boolean
	readonly required: boolean
	readonly dense: boolean
	readonly disabled: boolean
	readonly readonly: boolean
}

export default {
	title: 'Inputs / Text Fields / Password Field',
	component: 'mo-field-password',
	args: {
		label: 'Password',
		value: 'correct horse battery staple',
		reveal: false,
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 16px; max-width: 320px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, value, reveal, required, dense, disabled, readonly }) => html`
		<mo-field-password label=${label} value=${value} ?reveal=${reveal} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-password>
	`,
}

/** `reveal` shows the password in plain text; the eye button at the end toggles it. */
export const Reveal: Story = {
	render: () => html`<mo-field-password value='correct horse battery staple' reveal></mo-field-password>`,
}

/** `autoComplete` is `current-password` by default; `new-password` lets the browser suggest a strong one. */
export const NewPassword: Story = {
	render: () => html`<mo-field-password label='New password' autoComplete='new-password'></mo-field-password>`,
}
