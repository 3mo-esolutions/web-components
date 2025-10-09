import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Number Fields / Field Percent',
	component: 'mo-field-percent',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 10,
	},
	package: p,
} as Meta

export const Percent: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-percent label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-percent>
	`
}