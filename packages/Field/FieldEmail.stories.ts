import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Email',
	component: 'mo-field-email',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Email = story({
	render: () => html`<mo-field-email label='Email'></mo-field-email>`
})

export const Dense = story({
	render: () => html`<mo-field-email dense label='Email'></mo-field-email>`
})

export const Required = story({
	render: () => html`<mo-field-email required label='Email'></mo-field-email>`
})

export const Readonly = story({
	render: () => html`<mo-field-email readonly label='Email'></mo-field-email>`
})

export const Disabled = story({
	render: () => html`<mo-field-email disabled label='Email'></mo-field-email>`
})