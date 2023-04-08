import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Button/SplitButton',
	component: 'mo-split-button',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const SplitButton = story({
	render: () => html`
		<mo-split-button>
			<mo-button leadingIcon='merge'>Merge</mo-button>
			<mo-list-item slot='more'>Squash & merge</mo-list-item>
			<mo-list-item slot='more'>Rebase & merge</mo-list-item>
		</mo-split-button>
	`
})