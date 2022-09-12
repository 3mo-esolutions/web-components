import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Button/Floating Action Button (FAB)',
	component: 'mo-fab',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Default = story({
	render: () => html`<mo-fab icon='add'></mo-fab>`
})

export const Dense = story({
	render: () => html`<mo-fab icon='add' dense></mo-fab>`
})

export const IconAtEnd = story({
	render: () => html`<mo-fab icon='add' iconAtEnd>Test</mo-fab>`
})

export const WithLabel = story({
	args: { label: 'Add' },
	argTypes: { label: { control: 'text' } },
	render: ({ label }) => html`<mo-fab icon='add'>${label}</mo-fab>`
})