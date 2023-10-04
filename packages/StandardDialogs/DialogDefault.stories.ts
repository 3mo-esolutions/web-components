import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { DialogDefault } from './index.js'

export default meta({
	title: 'Dialog Default',
	component: 'mo-dialog-default',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Default = story({
	render: () => html`<mo-button @click=${() => new DialogDefault({ heading: 'Heading', content: 'Content' }).confirm()}>Open</mo-button>`
})