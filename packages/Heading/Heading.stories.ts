import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Heading',
	component: 'mo-heading',
	args: {
		typography: 'heading1',
	},
	argTypes: {
		typography: { control: { type: 'select', options: ['heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6', 'subtitle1', 'subtitle2'] } },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Heading = story({
	render: ({ typography }) => html`<mo-heading typography=${typography}>Heading</mo-heading>`
})