import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly heading: string
	readonly open: boolean
}

export default {
	title: 'Layout / Expander',
	component: 'mo-expander',
	args: {
		heading: 'How long does delivery take?',
		open: false,
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ heading, open }) => html`
		<mo-expander heading=${heading} ?open=${open}>
			Two to three working days within the country, and five to seven to the rest of Europe; orders placed before noon leave the same day.
		</mo-expander>
	`,
}

/** The `heading` slot takes any content in place of the `heading` attribute, such as an icon beside the text. */
export const HeadingSlot: Story = {
	render: () => html`
		<mo-expander>
			<mo-flex slot='heading' direction='horizontal' alignItems='center' gap='10px'>
				<mo-icon icon='new_releases'></mo-icon>
				<mo-heading typography='heading4'>Release notes</mo-heading>
			</mo-flex>
			Faster sync, fewer fees and a new address format.
		</mo-expander>
	`,
}

/** Expanders stack into a list of questions, each opening on its own; a focused heading also toggles with Enter or Space. */
export const Stacked: Story = {
	render: () => html`
		<mo-flex gap='16px'>
			<mo-expander heading='How long does delivery take?'>
				Two to three working days within the country, and five to seven to the rest of Europe.
			</mo-expander>
			<mo-expander heading='Can I change my order?'>
				Until it leaves the warehouse: open the order in your account and edit its positions or the address.
			</mo-expander>
			<mo-expander heading='How do returns work?'>
				Within thirty days, in the original packaging, with the return label that came in the parcel.
			</mo-expander>
		</mo-flex>
	`,
}

/** The `header`, `heading` and `expand-collapse-icon-button` parts can be styled from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			.tinted::part(header) { background: var(--mo-color-transparent-gray-3); padding: 8px 12px; border-radius: var(--mo-border-radius); }
			.danger::part(heading) { color: var(--mo-color-red); }
			.no-icon::part(expand-collapse-icon-button) { display: none; }
		</style>
		<mo-flex gap='16px'>
			<mo-expander class='tinted' heading='Tinted header'>The header holds the heading and the button.</mo-expander>
			<mo-expander class='danger' heading='Red heading'>Only the heading is red.</mo-expander>
			<mo-expander class='no-icon' heading='Without a button'>The heading alone toggles the content.</mo-expander>
		</mo-flex>
	`,
}