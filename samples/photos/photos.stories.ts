import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Samples/Photos',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Photos = story({
	render: () => html`
		<photos-application></photos-application>
	`
})