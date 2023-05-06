import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Pdf',
	component: 'mo-pdf',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Pdf = story({
	render: () => html`
		<mo-pdf style='height: 600px' source='https://www.africau.edu/images/default/sample.pdf'></mo-pdf>
	`
})