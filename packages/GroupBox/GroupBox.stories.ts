import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly heading: string
}

export default {
	title: 'Layout / Group Box',
	component: 'mo-group-box',
	args: {
		heading: 'Delivery address',
	},
	decorators: [story => html`<div style='max-width: 600px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ heading }) => html`
		<mo-group-box heading=${heading}>
			<mo-flex gap='12px'>
				<mo-field-text label='Street'></mo-field-text>
				<mo-field-text label='City'></mo-field-text>
				<mo-field-text label='Country'></mo-field-text>
			</mo-flex>
		</mo-group-box>
	`,
}

/** The `action` slot places buttons beside the heading, and the `footer` slot below the content inside the card. */
export const Actions: Story = {
	render: ({ heading }) => html`
		<mo-group-box heading=${heading}>
			<mo-icon-button slot='action' icon='share'></mo-icon-button>
			<mo-icon-button slot='action' icon='more_vert'></mo-icon-button>
			<mo-flex gap='12px'>
				<mo-field-text label='Street'></mo-field-text>
				<mo-field-text label='City'></mo-field-text>
			</mo-flex>
			<mo-flex slot='footer' direction='horizontal' justifyContent='end'>
				<mo-button type='filled'>Save</mo-button>
			</mo-flex>
		</mo-group-box>
	`,
}

/** Long content grows the card below the heading. */
export const LongContent: Story = {
	render: () => html`
		<mo-group-box heading='Terms of delivery'>
			Orders placed on a working day before noon leave the warehouse the same day; later orders leave the next working day.
			Delivery within the country takes two to three working days, and five to seven to the rest of Europe.
			The carrier calls ahead on the day of delivery. If nobody answers, the parcel waits at the nearest depot for seven days before it comes back to us.
			Goods can be returned within thirty days in their original packaging; the return label is in the parcel.
			Refunds reach the original payment method within five working days of the return arriving.
		</mo-group-box>
	`,
}

/** The `card` part styles the card around the content, and the `header` and `heading` parts the header above it. */
export const Parts: Story = {
	render: ({ heading }) => html`
		<style>
			.tinted::part(card) { background: var(--mo-color-transparent-gray-3); box-shadow: none; }
			.tinted::part(heading) { color: var(--mo-color-accent); }
		</style>
		<mo-group-box class='tinted' heading=${heading}>
			<mo-flex gap='12px'>
				<mo-field-text label='Street'></mo-field-text>
				<mo-field-text label='City'></mo-field-text>
			</mo-flex>
		</mo-group-box>
	`,
}
