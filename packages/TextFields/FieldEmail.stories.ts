import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly value: string
	readonly required: boolean
	readonly dense: boolean
	readonly disabled: boolean
	readonly readonly: boolean
}

export default {
	title: 'Inputs / Text Fields / Email Field',
	component: 'mo-field-email',
	args: {
		label: 'Work email',
		value: 'ada@3mo.de',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 16px; max-width: 320px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, value, required, dense, disabled, readonly }) => html`
		<mo-field-email label=${label} value=${value} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-email>
	`,
}

/** Without a `label` the field is labelled "Email", in the page's language. */
export const DefaultLabel: Story = {
	render: () => html`<mo-field-email></mo-field-email>`,
}

/** A value the browser does not accept as an address makes the field invalid. */
export const Invalid: Story = {
	render: () => html`<mo-field-email value='ada@'></mo-field-email>`,
}
