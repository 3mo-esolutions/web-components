import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Field Password',
	component: 'mo-field-password',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		reveal: false,
		disabled: false,
		readonly: false,
		value: 'Password',
	},
	package: p,
} as Meta

export const Password: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value, reveal }) => html`
		<mo-field-password label=${label} ?required=${required} ?disabled=${disabled} ?reveal=${reveal} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-password>
	`
}