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
	title: 'Inputs / Date & Time Fields / Date Range Field',
	component: 'mo-field-date-range',
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
	decorators: [story => html`<div style='min-height: 250px; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 320px)); gap: 16px; align-content: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ precision, required, disabled, readonly, dense }) => html`
		<mo-field-date-range label='Vacation' precision=${precision} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-date-range>
	`,
}

/**
 * Each end has its own segments, and the arrow keys cross between them. Range shortcuts set both ends at once:
 * `w` this week, `nw` next week, `lm` last month. In the calendar, picking the start moves on to the end.
 */
export const Keyboard: Story = {
	render: () => html`
		<mo-field-date-range label='Vacation'></mo-field-date-range>
	`,
}

/** `value` is a `DateTimeRange`, and either end may be left open. */
export const Value: Story = {
	render: () => html`
		<mo-field-date-range label='This week' .value=${new DateTimeRange(new DateTime().weekStart, new DateTime().weekEnd)}></mo-field-date-range>
		<mo-field-date-range label='From today' .value=${new DateTimeRange(new DateTime(), undefined)}></mo-field-date-range>
	`,
}

/** At `month` or `year` precision each end is a whole month or year, and the presets offer only ranges of those. */
export const Precisions: Story = {
	render: () => html`
		<mo-field-date-range label='Months' precision='month'></mo-field-date-range>
		<mo-field-date-range label='Years' precision='year'></mo-field-date-range>
	`,
}

/** `dateDisabled` refuses the dates it returns `true` for, here weekends, at either end. */
export const DateDisabled: Story = {
	render: () => html`
		<mo-field-date-range label='Weekdays' .dateDisabled=${(date: DateTime) => date.dayOfWeek === 6 || date.dayOfWeek === 7}></mo-field-date-range>
	`,
}

/** A required field turns invalid once left empty; a disabled one ignores input and a readonly one only shows its value. */
export const States: Story = {
	render: () => html`
		<mo-field-date-range label='Required' required></mo-field-date-range>
		<mo-field-date-range label='Disabled' disabled .value=${new DateTimeRange(new DateTime().weekStart, new DateTime().weekEnd)}></mo-field-date-range>
		<mo-field-date-range label='Readonly' readonly .value=${new DateTimeRange(new DateTime().weekStart, new DateTime().weekEnd)}></mo-field-date-range>
	`,
}
