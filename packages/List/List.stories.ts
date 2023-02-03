import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/List',
	component: 'mo-list',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	},
})

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

export const Default = story({
	render: () => html`
		<mo-list>${items}</mo-list>
	`
})

export const ItemsWithoutList = story({
	render: () => items
})