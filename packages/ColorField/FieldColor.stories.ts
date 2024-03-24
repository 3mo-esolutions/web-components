import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Color Field',
	component: 'mo-field-color',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	package: p,
} as Meta

export const ColorField: StoryObj = {
	render: ({ label, required, disabled, dense, readonly }) => html`
		<mo-field-color label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-color>
	`
}