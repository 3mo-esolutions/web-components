import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Core/Input/Checkbox',
	component: 'mo-checkbox',
	args: {
		disabled: false,
		label: 'Label',
		value: 'unchecked',
	},
	argTypes: {
		disabled: { control: 'boolean' },
		label: { control: 'text' },
		value: { control: { type: 'select', options: ['checked', 'indeterminate', 'unchecked'] } },
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
	render: ({ label, disabled, value }) => html`
		<mo-checkbox
			label=${label}
			?disabled=${disabled}
			value=${value}
		></mo-checkbox>
	`
})