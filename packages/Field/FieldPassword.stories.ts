import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Field/Password',
	component: 'mo-field-password',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Password = story({
	render: () => html`<mo-field-password label='Label' value='Password'></mo-field-password>`
})

export const Dense = story({
	render: () => html`<mo-field-password dense label='Label' value='Password'></mo-field-password>`
})

export const Required = story({
	render: () => html`<mo-field-password required label='Label' value='Password'></mo-field-password>`
})

export const Readonly = story({
	render: () => html`<mo-field-password readonly label='Label' value='Password'></mo-field-password>`
})

export const Disabled = story({
	render: () => html`<mo-field-password disabled label='Label' value='Password'></mo-field-password>`
})