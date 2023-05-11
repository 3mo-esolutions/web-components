import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Chip',
	component: 'mo-chip',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Chip = story({
	render: () => html`<mo-chip>Chip</mo-chip>`
})

export const WithLeadingIcon = story({
	render: () => html`
		<mo-chip>
			<mo-icon-button dense slot='leading' icon='calendar_today'></mo-icon-button>
			With Leading Icon
		</mo-chip>
	`
})

export const WithTrailingIcon = story({
	render: () => html`
		<mo-chip>
			With Trailing Icon
			<mo-icon-button dense slot='trailing' icon='delete'></mo-icon-button>
		</mo-chip>
	`
})

export const WithoutRipple = story({
	render: () => html`
		<style>
			mo-chip::part(ripple) { display: none; }
		</style>
		<mo-chip>Chip</mo-chip>
	`
})