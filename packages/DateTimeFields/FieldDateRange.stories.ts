import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

export default {
	title: 'Selection & Input / Date Time Fields / Field Date Range',
	component: 'mo-field-date-range',
	args: {
		precision: FieldDateTimePrecision.Day.toString(),
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	argTypes: {
		precision: {
			control: 'select',
			options: FieldDateTimePrecision.all.filter(p => p <= FieldDateTimePrecision.Day).map(p => p.toString())
		}
	},
	package: p,
	decorators: [story => html`<div style='height: 250px'>${story()}</div>`]
} as Meta

export const FieldDateRange: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, precision }) => html`
		<mo-field-date-range
			label=${label}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
			precision=${precision}
		></mo-field-date-range>
	`
}