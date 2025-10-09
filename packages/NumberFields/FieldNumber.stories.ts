import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Selection & Input / Number Fields / Field Number',
	component: 'mo-field-number',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 0,
	},
	package: p,
} as Meta

export const Number: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-number label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-number>
	`
}

export const MinMaxStep: StoryObj = {
	render: () => html`
		<mo-field-number label='Number' step='2' max='50' min='0'>
			<span slot='end'>/50</span>
		</mo-field-number>
	`
}