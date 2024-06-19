import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import '@material/web/tabs/primary-tab.js'

export default {
	title: 'Tab',
	component: 'mo-tab',
	args: { value: 'overview' },
	argTypes: {
		value: { control: 'select', options: ['overview', 'flights', 'trips', 'explore'] },
	},
	package: p,
} as Meta

export const Tab: StoryObj = {
	args: { value: 'tab-1' },
	render: ({ value }) => html`
		<mo-tab-bar value=${value}>
			<mo-tab value='overview'>Overview</mo-tab>
			<mo-tab value='flights'>Flights</mo-tab>
			<mo-tab value='trips'>Trips</mo-tab>
			<mo-tab value='explore'>Explore</mo-tab>
		</mo-tab-bar>
	`
}

export const WithIcons: StoryObj = {
	render: ({ value }) => html`
		<mo-tab-bar value=${value} style='height: 60px'>
			<mo-tab value='overview'>
				<mo-icon icon='list_alt'></mo-icon>
				Overview
			</mo-tab>
			<mo-tab value='flights'>
				<mo-icon icon='flight'></mo-icon>
				Flights
			</mo-tab>
			<mo-tab value='trips'>
				<mo-icon icon='luggage'></mo-icon>
				Trips
			</mo-tab>
			<mo-tab value='explore'>
				<mo-icon icon='explore'></mo-icon>
				Explore
			</mo-tab>
		</mo-tab-bar>
	`
}

export const WithCustomColors: StoryObj = {
	args: { value: 'tab-1' },
	render: ({ value }) => html`
		<mo-tab-bar value=${value} style='--mo-tab-background-color: var(--mo-color-transparent-gray-3); --mo-tab-accent-color: var(--mo-color-red); --mo-tab-color: green'>
			<mo-tab value='overview'>Overview</mo-tab>
			<mo-tab value='flights'>Flights</mo-tab>
			<mo-tab value='trips'>Trips</mo-tab>
			<mo-tab value='explore'>Explore</mo-tab>
		</mo-tab-bar>
	`
}