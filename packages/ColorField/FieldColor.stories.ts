import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'ColorField',
	component: 'mo-field-color',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const ColorField = story({
	render: ({ label, required, disabled, dense, readonly }) => html`
		<mo-field-color label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-color>
	`
})