import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Avatar',
	component: 'mo-avatar',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Avatar = story({
	render: () => html`<mo-avatar>AZ</mo-avatar>`
})