import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Feedback / Empty State',
	component: 'mo-empty-state',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`<mo-empty-state icon='youtube_searched_for' style='height: 400px'>No results</mo-empty-state>`,
}

/** The icon says what is missing; the message and the icon center in whatever space the element is given. */
export const Icons: StoryObj = {
	decorators: [story => html`<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px'>${story()}</div>`],
	render: () => html`
		<mo-empty-state icon='folder' style='height: 240px'>No files found</mo-empty-state>
		<mo-empty-state icon='touch_app' style='height: 240px'>Select a page</mo-empty-state>
		<mo-empty-state icon='inbox' style='height: 240px'>The inbox is empty</mo-empty-state>
	`,
}

/** Without `icon`, only the message shows. */
export const WithoutIcon: StoryObj = {
	render: () => html`<mo-empty-state style='height: 240px'>No results</mo-empty-state>`,
}

/** An action in the slot lets the reader fill the view. */
export const Actions: StoryObj = {
	render: () => html`
		<mo-empty-state icon='youtube_searched_for' style='height: 400px'>
			<div style='display: flex; flex-direction: column; align-items: center; gap: 8px'>
				Nothing found
				<mo-button type='outlined'>Create new</mo-button>
			</div>
		</mo-empty-state>
	`,
}
