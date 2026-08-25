import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, live, style } from '@a11d/lit'
import p from './package.json'
import './index.js'
import '@3mo/button'
import '@3mo/flex'
import '@3mo/icon'

export default {
	title: 'Layout & Containment / Accordion',
	component: 'mo-accordion',
	args: {
		multiple: false,
		value: 'shipping',
	},
	argTypes: {
		multiple: { control: 'boolean' },
		value: { control: 'inline-radio', options: ['', 'shipping', 'payment', 'returns'] },
		onChange: { action: 'change' },
		onOpenChange: { action: 'openChange' },
	},
	package: p,
} as Meta

const shipping = 'Orders placed before 4pm are dispatched the same day. Delivery takes two to four working days within the EU and up to ten elsewhere.'
const payment = 'We accept every major card, SEPA direct debit and invoice for business customers. The amount is captured once the order ships.'
const returns = 'Send anything back within 30 days of delivery and the refund goes to the original means of payment within a week of it reaching us.'

export const Accordion: StoryObj = {
	// The accordion moves its own value on as it is used, so the controls write the live properties: an
	// attribute binding would compare against what it last rendered and go quiet once the two have parted.
	render: ({ multiple, value, onChange, onOpenChange }) => html`
		<mo-accordion .multiple=${live(multiple)} .value=${live(value || undefined)} @change=${onChange} @openChange=${onOpenChange}>
			<mo-accordion-item value='shipping' heading='Shipping'>${shipping}</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment'>${payment}</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>${returns}</mo-accordion-item>
		</mo-accordion>
	`
}

/**
 * A heading is more than its text often enough: the "start" slot leads it with an icon and the "end" slot
 * trails it with whatever the item is worth summarizing by, so that a collapsed item still says something.
 * Both sit within the summary, which is a button — decorate it, but leave the controls to the content.
 */
export const RichHeadings: StoryObj = {
	render: () => html`
		<mo-accordion multiple>
			<mo-accordion-item value='shipping'>
				<mo-icon slot='start' icon='local_shipping'></mo-icon>
				<span slot='heading'>Shipping</span>
				<span slot='end' ${style({ color: 'var(--mo-color-gray)' })}>2–4 days</span>
				${shipping}
			</mo-accordion-item>

			<mo-accordion-item value='payment'>
				<mo-icon slot='start' icon='credit_card'></mo-icon>
				<span slot='heading'>Payment</span>
				<span slot='end' ${style({ color: 'var(--mo-color-gray)' })}>4 methods</span>
				${payment}
			</mo-accordion-item>

			<mo-accordion-item value='returns'>
				<mo-icon slot='start' icon='assignment_return'></mo-icon>
				<span slot='heading'>Returns</span>
				<span slot='end' ${style({ color: 'var(--mo-color-gray)' })}>30 days</span>
				${returns}
			</mo-accordion-item>
		</mo-accordion>
	`
}

/**
 * An item which is disabled refuses the interaction, not the state — an accordion may still open it, which is
 * what a section that is unlocked further down a form needs.
 */
export const Disabled: StoryObj = {
	render: () => html`
		<mo-accordion>
			<mo-accordion-item value='shipping' heading='Shipping'>${shipping}</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment' disabled>${payment}</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>${returns}</mo-accordion-item>
		</mo-accordion>
	`
}

/**
 * The items are flush against each other and divided by a line. Since they live in the light DOM and hand
 * their innards out as parts, the very same markup becomes a stack of cards from the outside, with nothing
 * on the accordion itself to configure.
 */
export const Spaced: StoryObj = {
	render: () => html`
		<style>
			#spaced {
				gap: 0.5rem;
			}

			#spaced mo-accordion-item {
				border: none;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1);
				overflow: hidden;
			}

			#spaced mo-accordion-item::part(summary) {
				padding: 1rem;
			}
		</style>

		<mo-accordion id='spaced'>
			<mo-accordion-item value='shipping' heading='Shipping'>${shipping}</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment'>${payment}</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>${returns}</mo-accordion-item>
		</mo-accordion>
	`
}

/**
 * Which item is open is a value like any other: it can be read, written and bound to. It reads as an array
 * while "multiple" is set. Opening an item reports a "change" in the actions panel, while a value handed to
 * the accordion stays quiet there — the convention the platform sets for a control which is a choice.
 */
export const Controlled: StoryObj = {
	render: ({ onChange }) => {
		const handleClick = (event: Event) => {
			const value = (event.target as HTMLElement).closest('mo-button')?.dataset.value
			if (value !== undefined) {
				(event.currentTarget as HTMLElement).querySelector('mo-accordion')!.value = value || undefined
			}
		}
		return html`
			<mo-flex gap='0.75rem' alignItems='stretch' @click=${handleClick}>
				<mo-flex direction='horizontal' gap='0.5rem' alignItems='center'>
					<mo-button type='outlined' data-value='shipping'>Shipping</mo-button>
					<mo-button type='outlined' data-value='returns'>Returns</mo-button>
					<mo-button type='outlined' data-value=''>Close</mo-button>
				</mo-flex>

				<mo-accordion @change=${onChange}>
					<mo-accordion-item value='shipping' heading='Shipping'>${shipping}</mo-accordion-item>
					<mo-accordion-item value='payment' heading='Payment'>${payment}</mo-accordion-item>
					<mo-accordion-item value='returns' heading='Returns'>${returns}</mo-accordion-item>
				</mo-accordion>
			</mo-flex>
		`
	}
}

/**
 * An accordion inside an item looks after its own items and leaves the surrounding one alone. The outer item
 * follows along as the inner one grows, since neither of them animates towards a height anyone had to measure.
 */
export const Nested: StoryObj = {
	render: () => html`
		<mo-accordion>
			<mo-accordion-item value='orders' heading='Orders'>
				<mo-accordion ${style({ marginBlockStart: '0.5rem' })}>
					<mo-accordion-item value='shipping' heading='Shipping'>${shipping}</mo-accordion-item>
					<mo-accordion-item value='returns' heading='Returns'>${returns}</mo-accordion-item>
				</mo-accordion>
			</mo-accordion-item>

			<mo-accordion-item value='payment' heading='Payment'>${payment}</mo-accordion-item>
		</mo-accordion>
	`
}