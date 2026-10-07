import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, type HTMLTemplateResult } from '@a11d/lit'
import { orderEvents } from './stories/order.js'
import './index.js'

type Args = {
	readonly direction: 'vertical' | 'horizontal'
}

export default {
	title: 'Data / Timeline',
	component: 'mo-timeline',
	args: {
		direction: 'vertical',
	},
	argTypes: {
		direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ direction }) => html`
		<mo-timeline direction=${direction}>
			<mo-timeline-item>Order placed</mo-timeline-item>
			<mo-timeline-item>Order confirmed</mo-timeline-item>
			<mo-timeline-item>Sent</mo-timeline-item>
			<mo-timeline-item>Delivered</mo-timeline-item>
		</mo-timeline>
	`,
}

/** An item takes any content, such as a message above its date, and long content stretches its line. */
export const RichContent: Story = {
	render: () => html`
		<mo-timeline>
			${orderEvents.map(event => html`
				<mo-timeline-item>
					<mo-flex>
						${event.content}
						<span style='opacity: 0.5; font-size: small'>${event.date}</span>
					</mo-flex>
				</mo-timeline-item>
			`)}
		</mo-timeline>
	`,
}

/** `direction='horizontal'` lays the items out in a row, with the meta above the line and the content below. */
export const Horizontal: Story = {
	render: () => html`
		<mo-timeline direction='horizontal'>
			${orderEvents.map(event => html`
				<mo-timeline-item meta=${event.date} icon=${event.icon}>${event.heading}</mo-timeline-item>
			`)}
		</mo-timeline>
	`,
}

/** `icon` takes a character such as an emoji in place of the bullet point, and the `icon` slot any element. */
export const Icons: Story = {
	render: () => html`
		<mo-timeline>
			<mo-timeline-item icon='🧺'>Order placed</mo-timeline-item>
			<mo-timeline-item>Order confirmed</mo-timeline-item>
			<mo-timeline-item icon='📦'>Packing</mo-timeline-item>
			<mo-timeline-item>
				<mo-icon slot='icon' icon='local_shipping' style='color: var(--mo-color-accent)'></mo-icon>
				Sent
			</mo-timeline-item>
			<mo-timeline-item icon='✅'>Delivered</mo-timeline-item>
		</mo-timeline>
	`,
}

/** `meta` places text such as a date in a column of its own beside the content; the `meta` slot takes any element instead. */
export const MetaInformation: Story = {
	render: () => html`
		<mo-timeline>
			${orderEvents.map(event => html`
				<mo-timeline-item icon=${event.icon} meta=${event.date}>${event.content}</mo-timeline-item>
			`)}
		</mo-timeline>
	`,
}

/** `line` draws the line to the next item from the default one, here doubled after the first rating. */
export const CustomLine: Story = {
	render: () => html`
		<mo-timeline>
			${orderEvents.map(event => html`
				<mo-timeline-item icon=${event.icon}
					.line=${(line: HTMLTemplateResult) => !event.continuous ? line : html`${line} ${line}`}
				>${event.content}</mo-timeline-item>
			`)}
		</mo-timeline>
	`,
}

/** The bullet point's color and the space below each item are custom properties. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-timeline style='--mo-timeline-item-bullet-color: var(--mo-color-accent); --mo-timeline-item-padding-end: 12px'>
			<mo-timeline-item meta='10 days ago'>Order placed</mo-timeline-item>
			<mo-timeline-item meta='10 days ago'>Order confirmed</mo-timeline-item>
			<mo-timeline-item meta='8 days ago'>Sent</mo-timeline-item>
			<mo-timeline-item meta='2 days ago' style='--mo-timeline-item-bullet-color: var(--mo-color-green)'>Delivered</mo-timeline-item>
		</mo-timeline>
	`,
}

/** The `meta` and `icon` parts can be restyled, here with the meta written vertically. */
export const Parts: Story = {
	render: () => html`
		<style>
			.vertical-meta mo-timeline-item::part(meta) {
				writing-mode: vertical-lr;
				font-size: 12px;
				padding-block-end: 0px;
				padding-inline-end: var(--mo-timeline-item-padding-end, 35px);
			}
		</style>
		<mo-timeline class='vertical-meta'>
			${orderEvents.map(event => html`
				<mo-timeline-item icon=${event.icon} meta=${event.date}>${event.content}</mo-timeline-item>
			`)}
		</mo-timeline>
	`,
}
