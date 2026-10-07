import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, live } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import type { AccordionValue } from './Accordion.js'
import './index.js'
import '@3mo/button'
import '@3mo/flex'
import '@3mo/icon'

type Args = {
	readonly multiple: boolean
	readonly value: string
}

export default {
	title: 'Layout / Accordion',
	component: 'mo-accordion',
	args: {
		multiple: false,
		value: 'shipping',
	},
	argTypes: {
		value: { control: 'inline-radio', options: ['', 'shipping', 'payment', 'returns'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	// The accordion moves its value on by itself, so the controls write the live properties rather than attributes.
	render: ({ multiple, value }) => html`
		<mo-accordion .multiple=${live(multiple)} .value=${live(value || undefined)}>
			<mo-accordion-item value='shipping' heading='Shipping'>Orders placed before 4pm leave the same day.</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment'>Cards, SEPA direct debit and invoice.</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>Send anything back within 30 days.</mo-accordion-item>
		</mo-accordion>
	`,
}

/** `multiple` lets several items stay open, and `value` is then an array. */
export const Multiple: Story = {
	render: () => html`
		<mo-accordion multiple>
			<mo-accordion-item value='shipping' heading='Shipping' open>Orders placed before 4pm leave the same day.</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment' open>Cards, SEPA direct debit and invoice.</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>Send anything back within 30 days.</mo-accordion-item>
		</mo-accordion>
	`,
}

/** `start` leads the heading with an icon and `end` trails it with a summary, so a closed item still says something. The summary is a button, so keep controls in the content. */
export const RichHeadings: Story = {
	render: () => html`
		<mo-accordion multiple>
			<mo-accordion-item value='shipping'>
				<mo-icon slot='start' icon='local_shipping'></mo-icon>
				<span slot='heading'>Shipping</span>
				<span slot='end' style='color: var(--mo-color-gray)'>2–4 days</span>
				Orders placed before 4pm leave the same day.
			</mo-accordion-item>
			<mo-accordion-item value='payment'>
				<mo-icon slot='start' icon='credit_card'></mo-icon>
				<span slot='heading'>Payment</span>
				<span slot='end' style='color: var(--mo-color-gray)'>4 methods</span>
				Cards, SEPA direct debit and invoice.
			</mo-accordion-item>
			<mo-accordion-item value='returns'>
				<mo-icon slot='start' icon='assignment_return'></mo-icon>
				<span slot='heading'>Returns</span>
				<span slot='end' style='color: var(--mo-color-gray)'>30 days</span>
				Send anything back within 30 days.
			</mo-accordion-item>
		</mo-accordion>
	`,
}

/** A disabled item refuses clicks, not the state: the accordion's `value` can still open it. */
export const Disabled: Story = {
	render: () => html`
		<mo-accordion>
			<mo-accordion-item value='shipping' heading='Shipping'>Orders placed before 4pm leave the same day.</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment' disabled>Cards, SEPA direct debit and invoice.</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>Send anything back within 30 days.</mo-accordion-item>
		</mo-accordion>
	`,
}

/** The open item is a value to read, write and bind; `change` reports only what a click changes, not what is handed in. */
export const Controlled: Story = {
	render: () => {
		const [value, setValue] = useState<AccordionValue>('shipping')
		return html`
			<mo-flex gap='0.75rem'>
				<mo-flex direction='horizontal' gap='0.5rem'>
					<mo-button type='outlined' @click=${() => setValue('shipping')}>Shipping</mo-button>
					<mo-button type='outlined' @click=${() => setValue('returns')}>Returns</mo-button>
					<mo-button type='outlined' @click=${() => setValue(undefined)}>Close</mo-button>
				</mo-flex>
				<mo-accordion .value=${live(value)} @change=${(event: CustomEvent<AccordionValue>) => setValue(event.detail)}>
					<mo-accordion-item value='shipping' heading='Shipping'>Orders placed before 4pm leave the same day.</mo-accordion-item>
					<mo-accordion-item value='payment' heading='Payment'>Cards, SEPA direct debit and invoice.</mo-accordion-item>
					<mo-accordion-item value='returns' heading='Returns'>Send anything back within 30 days.</mo-accordion-item>
				</mo-accordion>
			</mo-flex>
		`
	},
}

/** An accordion inside an item looks after its own items, and the outer item grows along as the inner one opens. */
export const Nested: Story = {
	render: () => html`
		<mo-accordion>
			<mo-accordion-item value='orders' heading='Orders'>
				<mo-accordion style='margin-block-start: 0.5rem'>
					<mo-accordion-item value='shipping' heading='Shipping'>Orders placed before 4pm leave the same day.</mo-accordion-item>
					<mo-accordion-item value='returns' heading='Returns'>Send anything back within 30 days.</mo-accordion-item>
				</mo-accordion>
			</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment'>Cards, SEPA direct debit and invoice.</mo-accordion-item>
		</mo-accordion>
	`,
}

/** A lone item is a disclosure of its own, with `open` and `openChange`. As a native `details`, it opens for find-in-page too. */
export const StandaloneItem: Story = {
	render: () => html`
		<mo-accordion-item heading='Order 10482'>Two items, shipped on 3 September.</mo-accordion-item>
	`,
}

/** Items hand their innards out as parts, so the same markup becomes a stack of cards from outside. */
export const Parts: Story = {
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
			<mo-accordion-item value='shipping' heading='Shipping'>Orders placed before 4pm leave the same day.</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment'>Cards, SEPA direct debit and invoice.</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>Send anything back within 30 days.</mo-accordion-item>
		</mo-accordion>
	`,
}
