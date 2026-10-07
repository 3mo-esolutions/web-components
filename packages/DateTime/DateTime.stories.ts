import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import './index.js'

export default {
	title: 'Utilities / Date Time',
	decorators: [story => html`<mo-flex gap='8px' style='max-inline-size: 360px'>${story()}</mo-flex>`],
} satisfies Meta

/** `DateTime`, `DateTimeRange` and `TimeSpan` are globals. Formatting follows the language in the toolbar, with its calendar and time zone. */
export const Default: StoryObj = {
	render: () => {
		const now = new DateTime()
		return html`
			<span>${now.format({ dateStyle: 'full', timeStyle: 'short' })}</span>
			<span>${now.formatAsDate()}</span>
			<span>${now.format({ week: 'medium' })}</span>
		`
	},
}

/** Every operation returns a new `DateTime`: `add`, `subtract` and `with` take Temporal durations and fields, the `…Start`, `…End` and `…Range` getters snap to a day, week, month or year, and `since` measures a `TimeSpan`. */
export const Arithmetic: StoryObj = {
	render: () => {
		const now = new DateTime()
		return html`
			<span>${now.add({ days: 3 }).formatAsDate()}</span>
			<span>${now.subtract({ months: 1 }).formatAsDate()}</span>
			<span>${now.with({ day: 1 }).formatAsDate()}</span>
			<span>${now.weekRange.formatAsDateRange()}</span>
			<span>${now.yearStart.since(now).format()}</span>
			<span>${TimeSpan.fromHours(-50).format()}</span>
		`
	},
}

/** `toDateTime()` reads what people type, in the language's own order: a full date, a day of this month (`15`), day and month (`1503`), an offset (`+3`, `-2 weeks`) or `0` for today. */
export const Parsing: StoryObj = {
	render: () => {
		const [text, setText] = useState('+3')
		return html`
			<mo-field-text label='Date' .value=${text} @input=${(event: CustomEvent<string | undefined>) => setText(event.detail ?? '')}></mo-field-text>
			<span>${text.toDateTime()?.format({ dateStyle: 'full', timeStyle: 'short' }) ?? '—'}</span>
		`
	},
}

/** A `DateTimeRange` has two ends, either of which may be open, and formats them the way the language writes ranges. `toDateTimeRange()` parses one, each end as `toDateTime()` would. */
export const Ranges: StoryObj = {
	render: () => {
		const today = new DateTime()
		return html`
			<span>${new DateTimeRange(today, today.add({ days: 6 })).formatAsDateRange()}</span>
			<span>${new DateTimeRange(today).formatAsDateRange()}</span>
			<span>${new DateTimeRange(undefined, today).formatAsDateRange()}</span>
			<span>${'1 ~ 15'.toDateTimeRange()?.formatAsDateRange()}</span>
		`
	},
}
