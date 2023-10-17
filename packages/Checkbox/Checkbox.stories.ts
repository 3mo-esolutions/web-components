import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Checkbox',
	component: 'mo-checkbox',
	args: {
		disabled: false,
		label: 'Label',
		selected: false,
	},
	argTypes: {
		disabled: { control: 'boolean' },
		label: { control: 'text' },
		selected: { control: { type: 'select', options: [true, false, 'indeterminate'] } },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Checkbox = story({
	render: ({ label, disabled, selected }) => html`
		<mo-checkbox
			label=${label}
			?disabled=${disabled}
			.selected=${selected}
		></mo-checkbox>
	`
})

export const WithCustomAccentColor = story({
	render: ({ label, disabled, selected }) => html`
		<mo-checkbox style='--mo-checkbox-accent-color: var(--mo-color-red)'
			label=${label}
			?disabled=${disabled}
			.selected=${selected}
		></mo-checkbox>
	`
})