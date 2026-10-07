import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly currency: string
	readonly value: number
	readonly required: boolean
	readonly dense: boolean
	readonly disabled: boolean
	readonly readonly: boolean
}

export default {
	title: 'Inputs / Number Fields / Currency Field',
	component: 'mo-field-currency',
	args: {
		label: 'Price',
		currency: 'EUR',
		value: 11.22,
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 16px; max-width: 320px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, currency, value, required, dense, disabled, readonly }) => html`
		<mo-field-currency label=${label} currency=${currency} value=${value} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-currency>
	`,
}

/** `currency` takes an ISO 4217 code and shows its symbol; without one no symbol is shown. */
export const Currencies: Story = {
	render: () => html`
		<mo-field-currency label='Euro' currency='EUR' value='1500'></mo-field-currency>
		<mo-field-currency label='Pound' currency='GBP' value='1500'></mo-field-currency>
		<mo-field-currency label='Dollar' currency='USD' value='1500'></mo-field-currency>
		<mo-field-currency label='Without currency' value='1500'></mo-field-currency>
	`,
}
