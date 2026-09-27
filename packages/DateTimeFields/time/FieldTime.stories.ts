import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../../.storybook/source.js'
import meetingTimesSource from '../stories/MeetingTimes.ts?raw'
import '../stories/MeetingTimes.js'
import '../index.js'

type Args = {
	readonly required: boolean
	readonly disabled: boolean
	readonly readonly: boolean
	readonly dense: boolean
}

export default {
	title: 'Inputs / Date & Time Fields / Time Field',
	component: 'mo-field-time',
	args: {
		required: false,
		disabled: false,
		readonly: false,
		dense: false,
	},
	decorators: [story => html`<div style='min-height: 250px; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 220px)); gap: 16px; align-content: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ required, disabled, readonly, dense }) => html`
		<mo-field-time label='Start' ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-time>
	`,
}

/** `value` is the 24-hour `HH:mm` string of a native time input, while the segments follow the language's clock - switch the language to see it. */
export const Value: Story = {
	render: () => html`
		<mo-field-time label='Start' value='14:30'></mo-field-time>
	`,
}

/** `precision='second'` adds the seconds, and the value becomes `HH:mm:ss`. */
export const Seconds: Story = {
	render: () => html`
		<mo-field-time label='Lap time' precision='second' value='14:30:15'></mo-field-time>
	`,
}

/** `hourCycle` sets the clock regardless of the language: `h12` with AM and PM, or `h23`. */
export const HourCycle: Story = {
	render: () => html`
		<mo-field-time label='12-hour clock' hourCycle='h12' value='14:30'></mo-field-time>
		<mo-field-time label='24-hour clock' hourCycle='h23' value='14:30'></mo-field-time>
	`,
}

/** `pickerHidden` removes the hour and minute lists, leaving the segments to type into. */
export const PickerHidden: Story = {
	render: () => html`
		<mo-field-time label='Start' pickerHidden></mo-field-time>
	`,
}

/**
 * `FieldTimeController` carries everything the field does - the segments, the `HH:mm` value, the picker key and the validity - so a time field
 * of another design only renders it. Here each field suggests times in a list Alt+ArrowDown opens, the end offers only later times, and moving the start carries the end along.
 */
export const CustomTimeField: Story = {
	parameters: sourceOf(meetingTimesSource),
	render: ({ required, disabled, readonly }) => html`
		<story-meeting-times ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></story-meeting-times>
	`,
}