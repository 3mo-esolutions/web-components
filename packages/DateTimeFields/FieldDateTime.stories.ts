import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

export default {
	title: 'Selection & Input / Date Time Fields / Field Date Time',
	component: 'mo-field-date-time',
	args: {
		precision: FieldDateTimePrecision.Minute.toString(),
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		min: '',
		max: '',
	},
	argTypes: {
		precision: {
			control: 'select',
			options: FieldDateTimePrecision.all.map(p => p.toString()),
		}
	},
	package: p,
	decorators: [story => html`<div style='height: 250px'>${story()}</div>`]
} as Meta

export const FieldDateTime: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, precision, min, max }) => html`
		<mo-field-date-time
			label=${label}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
			precision=${precision}
			min=${min}
			max=${max}
		></mo-field-date-time>
	`
}

export const DateDisabled: StoryObj = {
	render: ({ precision }) => html`
		<mo-field-date-time label='Weekends disabled' precision=${precision}
			.dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}
		></mo-field-date-time>
	`
}