import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import '../index.js'

type Args = {
	readonly precision: string
	readonly required: boolean
	readonly disabled: boolean
	readonly readonly: boolean
	readonly dense: boolean
}

export default {
	title: 'Inputs / Date & Time Fields / Date Field',
	component: 'mo-field-date',
	args: {
		precision: 'day',
		required: false,
		disabled: false,
		readonly: false,
		dense: false,
	},
	argTypes: {
		precision: { control: 'select', options: ['year', 'month', 'week', 'day'] },
	},
	decorators: [story => html`<div style='min-height: 250px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 260px)); gap: 16px; align-content: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ precision, required, disabled, readonly, dense }) => html`
		<mo-field-date label='Due date' precision=${precision} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-date>
	`,
}

/**
 * Digits fill the segments, which move on when full; ArrowUp and ArrowDown step a unit and Alt+ArrowDown opens the calendar.
 * A leading `+` or `-` types a shortcut instead, resolved on Enter: `+1` is tomorrow and `-1w` a week ago. Pasted dates are parsed too.
 */
export const Keyboard: Story = {
	render: () => html`
		<mo-field-date label='Due date'></mo-field-date>
	`,
}

/** Shortcuts count from `shortcutReferenceDate` instead of today: `+1` here is 16 January 2030. */
export const ShortcutReferenceDate: Story = {
	render: () => html`
		<mo-field-date label='Due date' shortcutReferenceDate='2030-01-15'></mo-field-date>
	`,
}

/** `precision` picks a year, a month, a week or a day. Without a label, each field names its precision. */
export const Precisions: Story = {
	render: () => html`
		<mo-field-date precision='year'></mo-field-date>
		<mo-field-date precision='month'></mo-field-date>
		<mo-field-date precision='week'></mo-field-date>
		<mo-field-date precision='day'></mo-field-date>
	`,
}

/** Days outside `min` and `max` are disabled in the calendar, presets outside them are left out, and a typed one makes the field invalid. */
export const MinAndMax: Story = {
	render: () => html`
		<mo-field-date label='Delivery date' .min=${new DateTime()} .max=${new DateTime().add({ days: 30 })}></mo-field-date>
	`,
}

/** `dateDisabled` refuses the dates it returns `true` for, here weekends. */
export const DateDisabled: Story = {
	render: () => html`
		<mo-field-date label='Weekday' .dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}></mo-field-date>
	`,
}

/** `pickerHidden` removes the calendar, leaving the segments to type into. */
export const PickerHidden: Story = {
	render: () => html`
		<mo-field-date label='Due date' pickerHidden></mo-field-date>
	`,
}

/** A required field turns invalid once left empty; a disabled one ignores input, a readonly one only shows its value, and a dense one is shorter. */
export const States: Story = {
	render: () => html`
		<mo-field-date label='Required' required></mo-field-date>
		<mo-field-date label='Disabled' disabled .value=${new Date()}></mo-field-date>
		<mo-field-date label='Readonly' readonly .value=${new Date()}></mo-field-date>
		<mo-field-date label='Dense' dense .value=${new Date()}></mo-field-date>
	`,
}
