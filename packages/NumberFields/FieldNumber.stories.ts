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
	title: 'Inputs / Number Fields / Number Field',
	component: 'mo-field-number',
	args: {
		label: 'Quantity',
		value: 1,
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
		<mo-field-number label=${label} value=${value} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-number>
	`,
}

/** A value outside `min` and `max` is clamped when it is committed - type 80 and leave the field. */
export const Range: Story = {
	render: () => html`
		<mo-field-number label='Seats' min='0' max='50' step='2'>
			<span slot='end'>/50</span>
		</mo-field-number>
	`,
}

/** The value is formatted in the page's language - switch it in the toolbar to see the separators change. */
export const Formatting: Story = {
	render: () => html`<mo-field-number label='Population' value='1234567.89'></mo-field-number>`,
}

/** `start` and `end` hold icons or units beside the number. */
export const Slots: Story = {
	render: () => html`
		<mo-field-number label='Weight' value='12.5'>
			<mo-icon slot='start' icon='scale'></mo-icon>
			<span slot='end'>kg</span>
		</mo-field-number>
	`,
}

/** Required, read-only, disabled and dense. */
export const States: Story = {
	render: () => html`
		<mo-field-number label='Required' required></mo-field-number>
		<mo-field-number label='Read-only' value='42' readonly></mo-field-number>
		<mo-field-number label='Disabled' value='42' disabled></mo-field-number>
		<mo-field-number label='Dense' value='42' dense></mo-field-number>
	`,
}
