import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Time',
	component: 'mo-field-time',
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

export const Time = story({
	render: ({ label, required, disabled, dense, readonly }) => html`
		<mo-field-time label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense}></mo-field-time>
	`
})