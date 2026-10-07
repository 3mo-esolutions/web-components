import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { Color } from '@3mo/color'
import './index.js'

type Args = {
	readonly label: string
	readonly required: boolean
	readonly dense: boolean
	readonly disabled: boolean
	readonly readonly: boolean
}

export default {
	title: 'Inputs / Color Field',
	component: 'mo-field-color',
	args: {
		label: 'Brand color',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 16px; max-width: 320px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ label, required, dense, disabled, readonly }) => html`
		<mo-field-color label=${label} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-color>
	`,
}

/** The value is a `Color`, shown as its hex code. Type another code, or pick one from the swatch at the end. */
export const Value: Story = {
	render: () => html`<mo-field-color label='Brand color' .value=${new Color('#3f51b5')}></mo-field-color>`,
}

/** Required, read-only, disabled and dense. */
export const States: Story = {
	render: () => html`
		<mo-field-color label='Required' required></mo-field-color>
		<mo-field-color label='Read-only' readonly .value=${new Color('#3f51b5')}></mo-field-color>
		<mo-field-color label='Disabled' disabled .value=${new Color('#3f51b5')}></mo-field-color>
		<mo-field-color label='Dense' dense></mo-field-color>
	`,
}
