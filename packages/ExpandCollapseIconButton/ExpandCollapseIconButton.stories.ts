import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Expand Collapse Icon Button',
	component: 'mo-expand-collapse-icon-button',
	args: {
		disabled: false,
		open: false,
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const ExpandCollapseIconButton = story({
	render: ({ disabled, open }) => html`
		<mo-expand-collapse-icon-button
			?disabled=${disabled}
			?open=${open}
		></mo-expand-collapse-icon-button>
	`
})