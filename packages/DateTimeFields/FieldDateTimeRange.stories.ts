import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { FieldDateTimePrecision } from './FieldDateTimeBase.js'

export default {
	title: 'Field Date Time Range',
	component: 'mo-field-date-time-range',
	args: {
		precision: FieldDateTimePrecision.Second,
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	argTypes: {
		precision: {
			control: {
				type: 'select',
				options: [
					FieldDateTimePrecision.Year,
					FieldDateTimePrecision.Month,
					FieldDateTimePrecision.Day,
					FieldDateTimePrecision.Hour,
					FieldDateTimePrecision.Minute,
					FieldDateTimePrecision.Second,
				]
			}
		}
	},
	package: p,
	decorators: [story => html`<div style='height: 250px'>${story()}</div>`]
} as Meta

export const FieldDateTimeRange: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, precision }) => html`
		<mo-field-date-time-range
			label=${label}
			precision=${precision}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
		></mo-field-date-time-range>
	`
}