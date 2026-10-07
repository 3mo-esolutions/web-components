import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../../.storybook/source.js'
import customDateTimeFieldSource from '../stories/CustomDateTimeField.ts?raw'
import '../stories/CustomDateTimeField.js'
import '../index.js'

type Args = {
	readonly precision: string
	readonly required: boolean
	readonly disabled: boolean
	readonly readonly: boolean
	readonly dense: boolean
}

export default {
	title: 'Inputs / Date & Time Fields / Date Time Field',
	component: 'mo-field-date-time',
	args: {
		precision: 'minute',
		required: false,
		disabled: false,
		readonly: false,
		dense: false,
	},
	argTypes: {
		precision: { control: 'select', options: ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'] },
	},
	decorators: [story => html`<div style='min-height: 250px; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 280px)); gap: 16px; align-content: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ precision, required, disabled, readonly, dense }) => html`
		<mo-field-date-time label='Appointment' precision=${precision} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-date-time>
	`,
}

/** Beyond the day, `precision` adds the hour, the minute or the second; the picker shows a list per unit beside the calendar. */
export const Precisions: Story = {
	render: () => html`
		<mo-field-date-time label='Hour' precision='hour'></mo-field-date-time>
		<mo-field-date-time label='Minute' precision='minute'></mo-field-date-time>
		<mo-field-date-time label='Second' precision='second'></mo-field-date-time>
	`,
}

/** The time follows the language's clock unless `hourCycle` sets one: `h12` with AM and PM, or `h23`. */
export const HourCycle: Story = {
	render: () => html`
		<mo-field-date-time label='12-hour clock' hourCycle='h12' .value=${new Date()}></mo-field-date-time>
		<mo-field-date-time label='24-hour clock' hourCycle='h23' .value=${new Date()}></mo-field-date-time>
	`,
}

/** `dateDisabled` refuses the dates it returns `true` for, here weekends. */
export const DateDisabled: Story = {
	render: () => html`
		<mo-field-date-time label='Weekday' .dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}></mo-field-date-time>
	`,
}

/**
 * `FieldDateTimeController` carries everything the field does - the segments, the picker, the presets, `min`, `max` and the validity -
 * so a date field of another design only renders it. Try the precision control.
 */
export const CustomDateTimeField: Story = {
	args: { precision: 'day' },
	parameters: sourceOf(customDateTimeFieldSource),
	render: ({ precision, required, disabled, readonly }) => html`
		<story-custom-date-time-field precision=${precision} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></story-custom-date-time-field>
	`,
}
