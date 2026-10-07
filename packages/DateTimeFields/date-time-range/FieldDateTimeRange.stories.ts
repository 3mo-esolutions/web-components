import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../../.storybook/source.js'
import customDateRangeFieldSource from '../stories/CustomDateRangeField.ts?raw'
import '../stories/CustomDateRangeField.js'
import '../index.js'

type Args = {
	readonly precision: string
	readonly required: boolean
	readonly disabled: boolean
	readonly readonly: boolean
	readonly dense: boolean
}

export default {
	title: 'Inputs / Date & Time Fields / Date Time Range Field',
	component: 'mo-field-date-time-range',
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
	decorators: [story => html`<div style='min-height: 250px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 400px)); gap: 16px; align-content: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ precision, required, disabled, readonly, dense }) => html`
		<mo-field-date-time-range label='Maintenance window' precision=${precision} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-date-time-range>
	`,
}

/** The picker edits one end at a time, chosen by its tabs or by entering that end's segments. */
export const Value: Story = {
	render: () => html`
		<mo-field-date-time-range label='Maintenance window' .value=${new DateTimeRange(new DateTime().dayStart.add({ hours: 22 }), new DateTime().dayStart.add({ hours: 30 }))}></mo-field-date-time-range>
	`,
}

/** `dateDisabled` refuses the dates it returns `true` for, here weekends, at either end. */
export const DateDisabled: Story = {
	render: () => html`
		<mo-field-date-time-range label='Weekdays' .dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}></mo-field-date-time-range>
	`,
}

/**
 * `FieldDateTimeRangeController` carries everything the field does - a group of segments per end, the end the picker edits,
 * range shortcuts, the presets and the validity - so a range field of another design only renders it. Here the ends are separate boxes.
 */
export const CustomRangeField: Story = {
	args: { precision: 'day' },
	parameters: sourceOf(customDateRangeFieldSource),
	render: ({ precision, required, disabled, readonly }) => html`
		<story-custom-date-range-field precision=${precision} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></story-custom-date-range-field>
	`,
}
