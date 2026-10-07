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
	title: 'Inputs / Text Fields / Search Field',
	component: 'mo-field-search',
	args: {
		label: 'Search products',
		value: 'chair',
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
		<mo-field-search label=${label} value=${value} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-search>
	`,
}

/** Without a `label` the field is labelled "Search", and a dense one suits a toolbar. The clear button appears once there is text. */
export const Dense: Story = {
	render: () => html`<mo-field-search dense></mo-field-search>`,
}

/** The `end` slot holds further actions, after the clear button. */
export const Slots: Story = {
	render: () => html`
		<mo-field-search label='Search products' value='chair'>
			<mo-icon-button slot='end' icon='tune' dense></mo-icon-button>
		</mo-field-search>
	`,
}
