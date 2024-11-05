import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'List',
	component: 'mo-list',
	package: p,
} as Meta

const keyboardShortcut = (shortcut: string) => html`
	<span style='font-size: 13px; color: darkgray'>${shortcut}</span>
`

const separator = html`
	<div role='separator' style='width: 100%; height: 1px; background: darkgray; opacity: 0.3'></div>
`

const items = html`
	<mo-list-item>
		<mo-icon style='opacity: 0.66' icon='inbox'></mo-icon>
		<span style='flex: 1'>Inbox</span>
		${keyboardShortcut('Ctrl + I')}
	</mo-list-item>
	<mo-list-item>
		<mo-icon style='opacity: 0.66' icon='drafts'></mo-icon>
		<span style='flex: 1'>Drafts</span>
		${keyboardShortcut('Ctrl + D')}
	</mo-list-item>
	${separator}
	<mo-list-item>Trash</mo-list-item>
	<mo-list-item>Spam</mo-list-item>
	${separator}
	<mo-list-item disabled style='opacity: 1'>
		<mo-icon style='opacity: 0.33' icon='settings_suggest'></mo-icon>
		<span>
			<span style='opacity: 0.5'>Personalization -</span>
			<mo-anchor style='pointer-events: auto;'>Upgrade to Pro!</mo-anchor>
		</span>
	</mo-list-item>
	<mo-list-item>
		<mo-icon style='opacity: 0.66' icon='logout'></mo-icon>
		Logout
	</mo-list-item>
`

export const Default: StoryObj = {
	render: () => html`
		<mo-list>${items}</mo-list>
	`
}

export const ItemsWithoutList: StoryObj = {
	render: () => items
}

export const CustomLayout: StoryObj = {
	render: () => html`
		<style>
			#custom {
				display: grid;
				grid-template-columns: auto 1fr auto;

				mo-list-item {
					grid-column: 1 / -1;
					display: grid;
					grid-template-columns: subgrid;
				}
			}
		</style>
		<mo-list id='custom'>${items}</mo-list>
	`
}