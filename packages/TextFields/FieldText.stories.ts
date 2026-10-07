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
	title: 'Inputs / Text Fields / Text Field',
	component: 'mo-field-text',
	args: {
		label: 'Name',
		value: 'Clarke Griffin',
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
		<mo-field-text label=${label} value=${value} ?required=${required} ?dense=${dense} ?disabled=${disabled} ?readonly=${readonly}></mo-field-text>
	`,
}

/** Required, read-only, disabled and dense. A required field turns invalid once it is emptied. */
export const States: Story = {
	render: () => html`
		<mo-field-text label='Required' required></mo-field-text>
		<mo-field-text label='Read-only' value='Clarke Griffin' readonly></mo-field-text>
		<mo-field-text label='Disabled' value='Clarke Griffin' disabled></mo-field-text>
		<mo-field-text label='Dense' dense></mo-field-text>
	`,
}

/** `maxLength` counts down the characters left, and a value shorter than `minLength` is invalid. */
export const Length: Story = {
	render: () => html`<mo-field-text label='Username' minLength='3' maxLength='16' value='ada'></mo-field-text>`,
}

/** `pattern` validates the value against a regular expression, as on a native input - type a letter. */
export const Pattern: Story = {
	render: () => html`<mo-field-text label='Postal code' pattern='[0-9]{5}' value='10115'></mo-field-text>`,
}

/** `start` and `end` hold text, icons or buttons beside the value. */
export const Slots: Story = {
	render: () => html`
		<mo-field-text label='Regex' value='^[a-z]+$'>
			<span slot='start'>/</span>
			<span slot='end'>/gm</span>
		</mo-field-text>
		<mo-field-text label='Website' value='3mo.de'>
			<mo-icon slot='start' icon='insert_link'></mo-icon>
			<mo-icon-button slot='end' icon='open_in_new' dense></mo-icon-button>
		</mo-field-text>
	`,
}

/** The value follows the field's `text-align`. */
export const TextAlign: Story = {
	render: () => html`<mo-field-text label='Amount' value='1.500' style='text-align: end'></mo-field-text>`,
}

/** With `width: fit-content` the field grows with its value - type a long one. */
export const ContentSizing: Story = {
	render: () => html`<mo-field-text label='Tag' value='web components' style='width: fit-content; min-width: 100px'></mo-field-text>`,
}
