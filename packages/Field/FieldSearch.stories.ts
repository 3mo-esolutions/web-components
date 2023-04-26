import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Search',
	component: 'mo-field-search',
	args: {
		label: 'Label',
		required: false,
		disabled: false,
		readonly: false,
		value: 'Value',
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Search = story({
	render: ({ label, value, required, disabled, readonly }) => html`
		<mo-field-search label=${label} value=${value} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}></mo-field-search>
	`
})

export const EndSlot = story({
	render: ({ label, required, disabled, readonly }) => html`
		<mo-field-search label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly}>
			<mo-icon-button slot='end' icon='settings'></mo-icon-button>
		</mo-field-search>
	`
})