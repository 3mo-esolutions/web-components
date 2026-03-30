import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'

export default {
	title: 'Selection & Input / Date Time Fields / Field Date',
	component: 'mo-field-date',
	args: {
		precision: FieldDateTimePrecision.Day.toString(),
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
			options: FieldDateTimePrecision.all.filter(p => p <= FieldDateTimePrecision.Day).map(p => p.toString())
		}
	},
	package: p,
	decorators: [story => html`<div style='height: 250px'>${story()}</div>`]
} as Meta

export const FieldDate: StoryObj = {
	render: ({ label, required, disabled, dense, readonly, precision, min, max }) => html`
		<mo-field-date
			label=${label}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
			precision=${precision}
			min=${min}
			max=${max}
		></mo-field-date>
	`
}

export const DateDisabled: StoryObj = {
	render: ({ precision }) => html`
		<mo-field-date label='Weekends disabled' precision=${precision}
			.dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}
		></mo-field-date>
	`
}