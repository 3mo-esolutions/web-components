import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Text Fields / Field Text Area',
	component: 'mo-field-text-area',
	args: {
		label: 'Label',
		required: false,
		disabled: false,
		readonly: false,
		value: 'Hey there!',
		rows: 4,
	},
	package: p,
} as Meta

export const TextArea: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-text-area label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-text-area>
	`
}

export const StartAndEndSlots: StoryObj = {
	render: ({ required, disabled, dense, readonly, value, rows }) => html`
		<mo-field-text-area label='Message' ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value} rows=${rows}>
			<mo-icon-button dense slot='start' icon='sentiment_satisfied_alt'></mo-icon-button>
			<mo-icon-button dense slot='end' icon='send'></mo-icon-button>
		</mo-field-text-area>
	`
}