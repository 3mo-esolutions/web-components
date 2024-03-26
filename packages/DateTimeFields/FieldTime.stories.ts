import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Field Time',
	component: 'mo-field-time',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	package: p,
	decorators: [story => html`<div style='height: 250px'>${story()}</div>`]
} as Meta

export const FieldTime: StoryObj = {
	render: ({ label, required, disabled, dense, readonly }) => html`
		<mo-field-time label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-time>
	`
}