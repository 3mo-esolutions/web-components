import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Field Percent',
	component: 'mo-field-percent',
	args: {
		label: 'Label',
		required: false,
		dense: false,
		disabled: false,
		readonly: false,
		value: 10,
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Percent = story({
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-percent label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-percent>
	`
})