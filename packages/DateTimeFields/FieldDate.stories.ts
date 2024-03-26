import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { FieldDateTimePrecision } from './FieldDateTimeBase.js'

export default {
	title: 'Field Date',
	component: 'mo-field-date',
	args: {
		precision: FieldDateTimePrecision.Day,
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
				]
			}
		}
	},
	package: p,
	decorators: [story => html`<div style='height: 250px'>${story()}</div>`]
} as Meta

export const FieldDate: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, precision }) => html`
		<mo-field-date
			label=${label}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
			precision=${precision}
		></mo-field-date>
	`
}