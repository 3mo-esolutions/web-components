import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Password',
	component: 'mo-field-password',
	args: {
		label: 'Label',
		required: false,
		disabled: false,
		readonly: false,
		value: 'Password',
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Password = story({
	render: ({ label, required, disabled, readonly, value }) => html`
		<mo-field-password label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} value=${value}></mo-field-password>
	`
})