import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly label: string
	readonly value: number
	readonly required: boolean
	readonly dense: boolean
	readonly disabled: boolean
	readonly readonly: boolean
}

export default {
	title: 'Inputs / Number Fields / Percent Field',
	component: 'mo-field-percent',
	args: {
		label: 'Discount',
		value: 10,
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
		<mo-field-percent label=${label} value=${value} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-percent>
	`,
}

/** The value is clamped to 0-100 when committed - type 150 and leave the field. `min` and `max` change the range. */
export const Range: Story = {
	render: () => html`
		<mo-field-percent label='Discount' value='10'></mo-field-percent>
		<mo-field-percent label='Change' value='-20' min='-100' max='500'></mo-field-percent>
	`,
}

/** `percentSign` replaces the sign shown at the end. */
export const PercentSign: Story = {
	render: () => html`<mo-field-percent label='Interest rate' value='3.5' percentSign='% p.a.'></mo-field-percent>`,
}