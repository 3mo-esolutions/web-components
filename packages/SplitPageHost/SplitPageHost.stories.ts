import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Layout & Containment / Split Page Host',
	component: 'mo-split-page-host',
	package: p,
} as Meta

export const SplitPageHost: StoryObj = {
	render: () => html`
		<mo-split-page-host>
			<mo-card slot='sidebar' style='--mo-card-body-padding: 0px'>
				<mo-list>
					<mo-navigation-list-item data-router-selected>Page 1 Heading</mo-navigation-list-item>
					<mo-navigation-list-item>Page 2 Heading</mo-navigation-list-item>
					<mo-navigation-list-item>Page 3 Heading</mo-navigation-list-item>
				</mo-list>
			</mo-card>

			<mo-page heading='Page 1 Heading'>
				<mo-card>
					Page content 1
				</mo-card>
			</mo-page>
		</mo-split-page-host>
	`
}