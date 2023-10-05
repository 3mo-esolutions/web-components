import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import '@material/web/tabs/primary-tab.js'

export default meta({
	title: 'Tab',
	component: 'mo-tab',
	args: { value: 'overview' },
	argTypes: {
		value: { control: { type: 'select', options: ['overview', 'flights', 'trips', 'explore'] } },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Tab = story({
	args: { value: 'tab-1' },
	render: ({ value }) => html`
		<mo-tab-bar value=${value}>
			<mo-tab value='overview'>Overview</mo-tab>
			<mo-tab value='flights'>Flights</mo-tab>
			<mo-tab value='trips'>Trips</mo-tab>
			<mo-tab value='explore'>Explore</mo-tab>
		</mo-tab-bar>
	`
})

export const WithIcons = story({
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
})

export const WithCustomColors = story({
	args: { value: 'tab-1' },
	render: ({ value }) => html`
		<mo-tab-bar value=${value} style='--mo-tab-background-color: var(--mo-color-transparent-gray-3); --mo-tab-accent-color: var(--mo-color-red); --mo-tab-color: green'>
			<mo-tab value='overview'>Overview</mo-tab>
			<mo-tab value='flights'>Flights</mo-tab>
			<mo-tab value='trips'>Trips</mo-tab>
			<mo-tab value='explore'>Explore</mo-tab>
		</mo-tab-bar>
	`
})