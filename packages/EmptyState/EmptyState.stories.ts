import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Communication / Empty State',
	component: 'mo-empty-state',
	package: p,
} as Meta

export const EmptyState: StoryObj = {
	render: () => html`
		<mo-empty-state icon='youtube_searched_for' style='height: 400px'>
			No Results
		</mo-empty-state>
	`
}

export const WithActions: StoryObj = {
	render: () => html`
		<mo-empty-state icon='youtube_searched_for' style='height: 400px'>
			<mo-flex gap='4px'>
				Nothing Found
				<mo-button type='outlined'>Create New</mo-button>
			</mo-flex>
		</mo-empty-state>
	`
}

export const EmptyStateFile: StoryObj = {
	render: () => html`
		<mo-empty-state icon='folder' style='height: 400px'>
			No Files Found
		</mo-empty-state>
	`
}

export const EmptyStatePage: StoryObj = {
	render: () => html`
		<mo-empty-state icon='touch_app' style='height: 400px'>
			Select a Page
		</mo-empty-state>
	`
}