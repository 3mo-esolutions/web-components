import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { GenericDialog } from './index.js'

export default meta({
	title: 'Generic Dialog',
	component: 'mo-generic-dialog',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Default = story({
	render: () => html`
		<mo-button @click=${() => new GenericDialog({ heading: 'Heading', content: 'Content' }).confirm()}>Open</mo-button>
	`
})