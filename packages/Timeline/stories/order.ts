import { html, type HTMLTemplateResult } from '@a11d/lit'

export type OrderEvent = {
	readonly date: string
	readonly icon: string
	readonly heading: string
	readonly content: string | HTMLTemplateResult
	readonly continuous?: boolean
}

export const orderEvents: ReadonlyArray<OrderEvent> = [
	{ date: '10 days ago', icon: '🧺', heading: 'Order placed', content: 'Order placed' },
	{ date: '10 days ago', icon: '', heading: 'Order confirmed', content: 'Order confirmation sent by email' },
	{ date: '8 days ago', icon: '📦', heading: 'Packing', content: 'Packing' },
	{ date: '8 days ago', icon: '🚚', heading: 'Sent', content: 'Sent' },
	{ date: '7 days ago', icon: '', heading: 'On route', content: 'On route' },
	{
		date: '6 days ago',
		icon: '',
		heading: 'Delay',
		content: html`
			<mo-flex gap='5px'>
				<span>The carrier announced a delay in the delivery:</span>
				<code>The delivery of the order has been delayed due to heavy traffic in the city. We apologize for the inconvenience and will deliver your order as soon as possible.</code>
				<span>The customer was notified of the new delivery date.</span>
			</mo-flex>
		`,
	},
	{ date: '2 days ago', icon: '✅', heading: 'Delivered', content: 'The order has been delivered to the customer.' },
	{ date: '2 days ago', icon: '⭐', heading: 'Rating', content: 'The customer rated the order with 5 stars.', continuous: true },
	{
		date: '2 days ago',
		icon: '💬',
		heading: 'Review',
		content: html`
			<mo-flex gap='5px'>
				<span>The customer reviewed the order:</span>
				<code>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</code>
			</mo-flex>
		`,
	},
	{ date: '1 hour ago', icon: '⭐', heading: 'Rating', content: 'The customer changed the rating to 4 stars.' },
]