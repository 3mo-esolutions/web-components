import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { AlertType } from './index.js'

type Args = {
	readonly type: AlertType
	readonly heading: string
	readonly collapsible: boolean
}

export default {
	title: 'Feedback / Alert',
	component: 'mo-alert',
	args: {
		type: AlertType.Info,
		heading: 'Invoices are sent at midnight',
		collapsible: false,
	},
	argTypes: {
		type: { control: 'select', options: Object.values(AlertType) },
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 8px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ type, heading, collapsible }) => html`
		<mo-alert type=${type} heading=${heading} ?collapsible=${collapsible}>Changes made after that go out with the next day's run.</mo-alert>
	`,
}

/** Each type brings its own color and icon: `info`, `success`, `warning` and `error`. */
export const Types: Story = {
	render: () => html`
		<mo-alert type='info' heading='A new version is available'></mo-alert>
		<mo-alert type='success' heading='The order was shipped'></mo-alert>
		<mo-alert type='warning' heading='The subscription ends in 3 days'></mo-alert>
		<mo-alert type='error' heading='The payment was declined'></mo-alert>
	`,
}

/** Content goes into the default slot, below the heading. */
export const Content: Story = {
	render: () => html`
		<mo-alert type='info' heading='A new version is available'>Reload the page to use it.</mo-alert>
		<mo-alert type='success' heading='The order was shipped'>It is expected to arrive on Friday.</mo-alert>
		<mo-alert type='warning' heading='The subscription ends in 3 days'>Renew it to keep your data.</mo-alert>
		<mo-alert type='error' heading='The payment was declined'>Check the card details and try again.</mo-alert>
	`,
}

/** Without a heading, the content sits next to the icon. */
export const WithoutHeading: Story = {
	render: () => html`
		<mo-alert type='info'>Reload the page to use the new version.</mo-alert>
		<mo-alert type='error'>The payment was declined.</mo-alert>
	`,
}

/** `collapsible` hides the content behind a button next to the heading, and `open` shows it; `openChange` reports the toggle. */
export const Collapsible: Story = {
	render: () => html`
		<mo-alert type='warning' heading='3 items are out of stock' collapsible>Office chair, standing desk and monitor arm.</mo-alert>
		<mo-alert type='warning' heading='2 items are running low' collapsible open>Desk lamp and keyboard.</mo-alert>
	`,
}

/** Long content wraps and keeps its distance from the icon. */
export const LongText: Story = {
	render: () => html`
		<mo-alert type='info' heading='Scheduled maintenance on Sunday between 02:00 and 04:00 in the morning'>
			During the maintenance window the shop stays open, but orders cannot be edited and invoices are sent once it is over. Payments made in that time are booked on Monday. Contact support if an order must be changed before then.
		</mo-alert>
	`,
}

/** An alert is as tall as its content; `height: 100%` stretches it, e.g. to match a taller neighbour in a grid. */
export const Height: Story = {
	render: () => html`
		<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 8px'>
			<mo-alert type='info' heading='Short' style='height: 100%'>One line.</mo-alert>
			<mo-alert type='info' heading='Long'>
				Several lines of content that make this alert taller than its neighbour, which stretches to the same height.
			</mo-alert>
		</div>
	`,
}

/** `--mo-alert-color` replaces the color of the type. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-alert type='info' heading='New feature' style='--mo-alert-color: #8957e5'>Invoices can now be split.</mo-alert>
		<mo-alert type='info' heading='Tip' style='--mo-alert-color: var(--mo-color-gray)'>Press Ctrl+K to search.</mo-alert>
	`,
}

/** The `heading` part can be restyled from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			.uppercase::part(heading) { text-transform: uppercase; }
		</style>
		<mo-alert class='uppercase' type='success' heading='The order was shipped'>It is expected to arrive on Friday.</mo-alert>
	`,
}