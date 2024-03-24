import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Field Text',
	component: 'mo-field-text',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 'Value',
	},
	package: p,
} as Meta

export const Text: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-text label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-text>
	`
}

export const MinMaxLength: StoryObj = {
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text label='Label (between 10 and 25 characters)' minLength='10' maxLength='25'
			?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}
		></mo-field-text>
	`
}

export const StartAndEndSlots: StoryObj = {
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text label='Regex' ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}>
			<span slot='start'>/</span>
			<span slot='end'>/gm</span>
		</mo-field-text>
	`
}