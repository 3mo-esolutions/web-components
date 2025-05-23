import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Text Fields / Field Email',
	component: 'mo-field-email',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 'test@3mo.de',
	},
	package: p,
} as Meta

export const Email: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-email label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-email>
	`
}