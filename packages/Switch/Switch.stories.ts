import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Switch',
	component: 'mo-switch',
	args: {
		disabled: false,
		label: 'Label',
		selected: false,
	},
	argTypes: {
		disabled: { control: 'boolean' },
		label: { control: 'text' },
		selected: { control: 'boolean' },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Switch = story({
	render: ({ label, disabled, selected }) => html`
		<mo-switch
			label=${label}
			?disabled=${disabled}
			?selected=${selected}
		></mo-switch>
	`
})

export const WithCustomAccentColor = story({
	render: ({ label, disabled, selected }) => html`
		<mo-switch style='--mo-switch-accent-color: var(--mo-color-yellow)'
			label=${label}
			?disabled=${disabled}
			?selected=${selected}
		></mo-switch>
	`
})

export const WithCustomUncheckedAndAccentColor = story({
	render: ({ label, disabled, selected }) => html`
		<mo-switch style='--mo-switch-accent-color: var(--mo-color-green); --mo-switch-unselected-color: var(--mo-color-red)'
			label=${label}
			?disabled=${disabled}
			?selected=${selected}
		></mo-switch>
	`
})