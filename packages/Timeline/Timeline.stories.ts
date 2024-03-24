import type { Meta, StoryObj } from '@storybook/web-components'
import { HTMLTemplateResult, html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Timeline',
	component: 'mo-timeline',
	package: p,
} as Meta

const data = [
	{
		date: '10 days ago',
		icon: '🧺',
		heading: 'Order placed',
		content: 'Order placed'
	},
	{
		date: '10 days ago',
		icon: '',
		heading: 'Order confirmed',
		content: 'Order shipment notification and email sent'
	},
	{
		date: '8 days ago',
		icon: '📦',
		heading: 'Packing',
		content: 'Packing'
	},
	{
		date: '8 days ago',
		icon: '🚚',
		heading: 'Sent',
		content: 'Sent'
	},
	{
		date: '7 days ago',
		icon: '',
		heading: 'On route',
		content: 'On route'
	},
	{
		date: '6 days ago',
		icon: '',
		heading: 'Delay',
		content: html`
			<mo-flex gap='5px'>
				<span>There has been a delay in the delivery of the order. The reason is announced by the carrier company as follows:</span>
				<code type='warning'>
					The delivery of the order has been delayed due to the heavy traffic in the city. We apologize for the inconvenience and will deliver your order as soon as possible.
				</code>
				<span>A new notification containing the new delivery date is sent to the customer.</span>
			</mo-flex>
		`
	},
	{
		date: '2 days ago',
		icon: '✅',
		heading: 'Delivered',
		content: 'The order has been delivered to the customer.'
	},
	{
		date: '2 days ago',
		icon: '⭐',
		heading: 'Rating',
		continuous: true,
		content: 'Customer rated the order as 5 stars!'
	},
	{
		date: '2 days ago',
		icon: '💬',
		heading: 'Review',
		content: html`
			<mo-flex gap='5px'>
				<span>The customer wrote a review for the order as follows:</span>
				<code>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</code>
			</mo-flex>
		`
	},
	{
		date: '1 hour ago',
		icon: '⭐',
		heading: 'Rating',
		content: 'Customer changed the rating of the order to 4 stars.'
	},
]

export const Timeline: StoryObj = {
	render: () => html`
		<mo-timeline>
			${data.map(({ date, content }) => html`
				<mo-timeline-item>
					<mo-flex>
						${content}
						<span style='opacity: 0.5; font-size: small;'>${date}</span>
					</mo-flex>
				</mo-timeline-item>
			`)}
		</mo-timeline>
	`
}

export const WithHorizontalDirection: StoryObj = {
	render: () => html`
		<mo-timeline direction='horizontal'>
			${data.map(({ date, heading, icon, continuous }) => html`
				<mo-timeline-item meta=${date} icon=${icon} .line=${(l: HTMLTemplateResult) => !continuous ? l : html`${l} ${l}`}>
					${heading}
				</mo-timeline-item>
			`)}
		</mo-timeline>
	`
}

export const WithCustomLine: StoryObj = {
	render: () => html`
		<mo-timeline>
			${data.map(({ icon, content, continuous }) => html`
				<mo-timeline-item icon=${icon} .line=${(l: HTMLTemplateResult) => !continuous ? l : html`${l} ${l}`}>
					${content}
				</mo-timeline-item>
			`)}
		</mo-timeline>
	`
}

export const WithIcons: StoryObj = {
	render: () => html`
		<mo-timeline>
			${data.map(({ date, icon, content }) => html`
				<mo-timeline-item icon=${icon}>
					<mo-flex>
						${content}
						<span style='opacity: 0.5; font-size: small;'>${date}</span>
					</mo-flex>
				</mo-timeline-item>
			`)}
		</mo-timeline>
	`
}

export const WithMeta: StoryObj = {
	render: () => html`
		<mo-timeline>
			${data.map(({ date, icon, content }) => html`
				<mo-timeline-item icon=${icon} meta=${date}>
					${content}
				</mo-timeline-item>
			`)}
		</mo-timeline>
	`
}

export const WithRotatedMeta: StoryObj = {
	render: () => html`
		<style>
			#rotated-meta mo-timeline-item::part(meta) {
				writing-mode: vertical-lr;
				font-size: 12px;
				padding-block-end: 0px;
				padding-inline-end: var(--mo-timeline-item-padding-end, 35px);
			}
		</style>
		<mo-timeline id='rotated-meta'>
			${data.map(({ date, icon, content }) => html`
				<mo-timeline-item icon=${icon} meta=${date}>
					${content}
				</mo-timeline-item>
			`)}
		</mo-timeline>
	`
}