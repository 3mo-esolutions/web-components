import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import collapsibleCardWithLineSource from './stories/CollapsibleCardWithLine.ts?raw'
import './stories/CollapsibleCardWithLine.js'
import './index.js'

type Args = {
	readonly heading: string
	readonly subHeading: string
	readonly collapsed: boolean
}

export default {
	title: 'Layout / Collapsible Card',
	component: 'mo-collapsible-card',
	args: {
		heading: 'Order #24080',
		subHeading: 'Serenity Freight',
		collapsed: false,
	},
	decorators: [story => html`<div style='display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 400px)); gap: 16px; align-items: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ heading, subHeading, collapsed }) => html`
		<mo-collapsible-card heading=${heading} subHeading=${subHeading} ?collapsed=${collapsed}>
			Twelve steel plates and four tubes of weld seam sealant, shipped from Toronto on Monday. Delivery is expected within five working days.
		</mo-collapsible-card>
	`,
}

/** With `showSubHeadingOnlyWhenCollapsed` the sub-heading appears only while collapsed, as a summary of the hidden body - expand the card to see it go. */
export const SubHeadingWhenCollapsed: Story = {
	render: () => html`
		<mo-collapsible-card heading='Delivery address' subHeading='Musterstraße 1, 10115 Berlin' showSubHeadingOnlyWhenCollapsed collapsed>
			<mo-flex gap='12px'>
				<mo-field-text label='Street' value='Musterstraße 1'></mo-field-text>
				<mo-field-text label='City' value='10115 Berlin'></mo-field-text>
			</mo-flex>
		</mo-collapsible-card>
	`,
}

/** `disableCollapse` disables the toggle, keeping the card expanded or collapsed as it is. */
export const DisableCollapse: Story = {
	render: ({ heading, subHeading }) => html`
		<mo-collapsible-card heading=${heading} subHeading=${subHeading} disableCollapse>
			Twelve steel plates, shipped on Monday.
		</mo-collapsible-card>
		<mo-collapsible-card heading=${heading} subHeading=${subHeading} disableCollapse collapsed>
			Twelve steel plates, shipped on Monday.
		</mo-collapsible-card>
	`,
}

/** With a height of its own the body fills it, and collapsing gives the height up down to the header. */
export const FixedHeight: Story = {
	render: ({ heading, subHeading }) => html`
		<mo-collapsible-card heading=${heading} subHeading=${subHeading} style='height: 400px'>
			Twelve steel plates and four tubes of weld seam sealant, shipped from Toronto on Monday. Delivery is expected within five working days.
			The carrier calls ahead on the day; if nobody answers, the parcel waits at the nearest depot for seven days.
			<mo-button slot='footer'>Read more</mo-button>
		</mo-collapsible-card>
	`,
}

/** A subclass can render more into the card, such as a line between the header and the body, which keeps its place while the body collapses. */
export const Subclassing: Story = {
	parameters: sourceOf(collapsibleCardWithLineSource),
	render: ({ heading, subHeading }) => html`
		<story-collapsible-card-with-line heading=${heading} subHeading=${subHeading}>
			<mo-field-text label='Street'></mo-field-text>
			<mo-field-text label='City'></mo-field-text>
			<mo-field-text label='Postal code'></mo-field-text>
			<mo-field-text label='Country'></mo-field-text>
			<mo-button slot='footer'>Save</mo-button>
		</story-collapsible-card-with-line>
	`,
}

/** `--mo-collapsible-card-transition-duration` sets how long collapsing takes, one second here, and `0s` turns the animation off. */
export const CustomProperties: Story = {
	render: ({ heading, subHeading }) => html`
		<mo-collapsible-card heading=${heading} subHeading=${subHeading} style='--mo-collapsible-card-transition-duration: 1s'>
			Twelve steel plates and four tubes of weld seam sealant, shipped from Toronto on Monday. Delivery is expected within five working days.
		</mo-collapsible-card>
		<mo-collapsible-card heading=${heading} subHeading=${subHeading} style='--mo-collapsible-card-transition-duration: 0s'>
			Twelve steel plates and four tubes of weld seam sealant, shipped from Toronto on Monday. Delivery is expected within five working days.
		</mo-collapsible-card>
	`,
}