import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/TextArea',
	component: 'mo-field-text-area',
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

export const TextArea = story({
	render: ({ label, required, disabled, dense, readonly, value }) => html`
		<mo-field-text-area label=${label} ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}></mo-field-text-area>
	`
})

export const StartAndEndSlots = story({
	render: ({ required, disabled, dense, readonly, value }) => html`
		<mo-field-text-area label='Regex' ?required=${required} ?disabled=${disabled} ?readonly=${readonly} ?dense=${dense} value=${value}>
			<span slot='start'>/</span>
			<span slot='end'>/gm</span>
		</mo-field-text-area>
	`
})