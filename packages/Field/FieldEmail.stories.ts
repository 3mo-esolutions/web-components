import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Email',
	component: 'mo-field-email',
	args: {
		label: 'Label',
		required: false,
		disabled: false,
		readonly: false,
		value: 'test@3mo.de',
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Email = story({
	render: ({ label, required, disabled, readonly, value }) => html`
		<mo-field-email label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} value=${value}></mo-field-email>
	`
})