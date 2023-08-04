import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { FieldDateTimePrecision } from './FieldDateTimeBase.js'

export default meta({
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
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const FieldDateTimeRange = story({
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
})