import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { FieldDateTimePrecision } from './FieldDateTimeBase.js'

export default meta({
	title: 'Field Date Time',
	component: 'mo-field-date-time',
	args: {
		precision: FieldDateTimePrecision.Minute,
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

export const FieldDateTime = story({
	render: ({ label, required, disabled, dense, readonly, precision }) => html`
		<mo-field-date-time
			label=${label}
			?required=${required}
			?disabled=${disabled}
			?readonly=${readonly}
			?dense=${dense}
			precision=${precision}
		></mo-field-date-time>
	`
})