import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/EmptyState',
	component: 'mo-empty-state',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const EmptyState = story({
	render: () => html`
		<mo-empty-state icon='youtube_searched_for' style='height: 400px'>
			No Results
		</mo-empty-state>
	`
})

export const EmptyStateFile = story({
	render: () => html`
		<mo-empty-state icon='folder' style='height: 400px'>
			No Files Found
		</mo-empty-state>
	`
})

export const EmptyStatePage = story({
	render: () => html`
		<mo-empty-state icon='touch_app' style='height: 400px'>
			Select a Page
		</mo-empty-state>
	`
})