import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly value: string
}

export default {
	title: 'Layout / Tabs',
	component: 'mo-tabs',
	args: {
		value: 'overview',
	},
	argTypes: {
		value: { control: 'select', options: ['overview', 'flights', 'trips'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ value }) => html`
		<mo-tabs value=${value} style='height: 250px'>
			<mo-tab value='overview'>Overview</mo-tab>
			<mo-tab value='flights'>Flights</mo-tab>
			<mo-tab value='trips'>Trips</mo-tab>
			<mo-tab-panel value='overview'>Everything at a glance.</mo-tab-panel>
			<mo-tab-panel value='flights'>The flights which are booked.</mo-tab-panel>
			<mo-tab-panel value='trips'>The trips they belong to.</mo-tab-panel>
		</mo-tabs>
	`,
}

/** `mo-tab-bar` is the bar alone, for tabs and content that cannot share a box, such as a bar in a page header; arrow keys move between its tabs. */
export const TabBar: Story = {
	render: ({ value }) => html`
		<mo-tab-bar value=${value}>
			<mo-tab value='overview'>Overview</mo-tab>
			<mo-tab value='flights'>Flights</mo-tab>
			<mo-tab value='trips'>Trips</mo-tab>
			<mo-tab value='explore'>Explore</mo-tab>
		</mo-tab-bar>
	`,
}

/** An icon in the `icon` slot stacks above the label, beside it with `inline-icon`, and stands alone without a label. */
export const Icons: Story = {
	render: () => html`
		<mo-flex gap='24px'>
			<mo-tab-bar value='overview'>
				<mo-tab value='overview'>
					<mo-icon slot='icon' icon='list_alt'></mo-icon>
					Overview
				</mo-tab>
				<mo-tab value='flights'>
					<mo-icon slot='icon' icon='flight'></mo-icon>
					Flights
				</mo-tab>
				<mo-tab value='trips'>
					<mo-icon slot='icon' icon='luggage'></mo-icon>
					Trips
				</mo-tab>
				<mo-tab value='explore'>
					<mo-icon slot='icon' icon='explore'></mo-icon>
					Explore
				</mo-tab>
			</mo-tab-bar>
			<mo-tab-bar value='overview'>
				<mo-tab value='overview' inline-icon>
					<mo-icon slot='icon' icon='list_alt'></mo-icon>
					Overview
				</mo-tab>
				<mo-tab value='flights' inline-icon>
					<mo-icon slot='icon' icon='flight'></mo-icon>
					Flights
				</mo-tab>
				<mo-tab value='trips' inline-icon>
					<mo-icon slot='icon' icon='luggage'></mo-icon>
					Trips
				</mo-tab>
				<mo-tab value='explore' inline-icon>
					<mo-icon slot='icon' icon='explore'></mo-icon>
					Explore
				</mo-tab>
			</mo-tab-bar>
			<mo-tab-bar value='overview'>
				<mo-tab value='overview' aria-label='Overview'>
					<mo-icon slot='icon' icon='list_alt'></mo-icon>
				</mo-tab>
				<mo-tab value='flights' aria-label='Flights'>
					<mo-icon slot='icon' icon='flight'></mo-icon>
				</mo-tab>
				<mo-tab value='trips' aria-label='Trips'>
					<mo-icon slot='icon' icon='luggage'></mo-icon>
				</mo-tab>
				<mo-tab value='explore' aria-label='Explore'>
					<mo-icon slot='icon' icon='explore'></mo-icon>
				</mo-tab>
			</mo-tab-bar>
		</mo-flex>
	`,
}

/** A hidden panel stays in the DOM, so what is typed into it survives switching to another tab and back. */
export const KeptState: Story = {
	render: () => html`
		<mo-tabs value='address' style='height: 200px'>
			<mo-tab value='address'>Address</mo-tab>
			<mo-tab value='payment'>Payment</mo-tab>
			<mo-tab-panel value='address' style='padding: 16px'>
				<mo-field-text label='Street'></mo-field-text>
			</mo-tab-panel>
			<mo-tab-panel value='payment' style='padding: 16px'>
				<mo-field-text label='IBAN'></mo-field-text>
			</mo-tab-panel>
		</mo-tabs>
	`,
}

/** More tabs than fit scroll sideways. */
export const Overflow: Story = {
	render: () => html`
		<mo-tab-bar value='month-6' style='max-width: 500px'>
			${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => html`
				<mo-tab value=${`month-${index}`}>${month}</mo-tab>
			`)}
		</mo-tab-bar>
	`,
}

/** `--mo-tab-accent-color` colors the active tab and its indicator, `--mo-tab-background-color` every tab and `--mo-tab-divider-color` the line below; the labels follow `color`. */
export const CustomProperties: Story = {
	render: ({ value }) => html`
		<mo-tab-bar value=${value} style='color: green; --mo-tab-background-color: var(--mo-color-transparent-gray-3); --mo-tab-accent-color: var(--mo-color-red); --mo-tab-divider-color: var(--mo-color-red)'>
			<mo-tab value='overview'>Overview</mo-tab>
			<mo-tab value='flights'>Flights</mo-tab>
			<mo-tab value='trips'>Trips</mo-tab>
			<mo-tab value='explore'>Explore</mo-tab>
		</mo-tab-bar>
	`,
}