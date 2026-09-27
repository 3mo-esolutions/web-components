import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Layout / Split Page Host',
	component: 'mo-split-page-host',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-split-page-host>
			<mo-card slot='sidebar' style='--mo-card-body-padding: 0px'>
				<mo-list>
					<mo-navigation-list-item data-router-selected>Profile</mo-navigation-list-item>
					<mo-navigation-list-item>Notifications</mo-navigation-list-item>
					<mo-navigation-list-item>Security</mo-navigation-list-item>
				</mo-list>
			</mo-card>
			<mo-page heading='Profile'>
				<mo-card>Name, e-mail address and avatar.</mo-card>
			</mo-page>
		</mo-split-page-host>
	`,
}

/** `--mo-split-page-host-sidebar-width` sets the width of the sidebar, `clamp(200px, 30%, 500px)` by default. */
export const CustomProperties: StoryObj = {
	render: () => html`
		<mo-split-page-host style='--mo-split-page-host-sidebar-width: 160px'>
			<mo-card slot='sidebar' style='--mo-card-body-padding: 0px'>
				<mo-list>
					<mo-navigation-list-item data-router-selected>Profile</mo-navigation-list-item>
					<mo-navigation-list-item>Notifications</mo-navigation-list-item>
					<mo-navigation-list-item>Security</mo-navigation-list-item>
				</mo-list>
			</mo-card>
			<mo-page heading='Profile'>
				<mo-card>Name, e-mail address and avatar.</mo-card>
			</mo-page>
		</mo-split-page-host>
	`,
}