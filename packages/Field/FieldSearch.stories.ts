import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Search',
	component: 'mo-field-search',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Search = story({
	render: () => html`<mo-field-search label='Search'></mo-field-search>`
})

export const Required = story({
	render: () => html`<mo-field-search required label='Search'></mo-field-search>`
})

export const Disabled = story({
	render: () => html`<mo-field-search disabled label='Search'></mo-field-search>`
})

export const Readonly = story({
	render: () => html`<mo-field-search readonly label='Search'></mo-field-search>`
})

export const EndSlot = story({
	render: () => html`
		<mo-field-search label='Search'>
			<mo-icon-button slot='end' icon='settings'></mo-icon-button>
		</mo-field-search>
	`
})