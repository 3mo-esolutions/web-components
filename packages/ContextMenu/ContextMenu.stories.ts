import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import { contextMenu } from './index.js'

export default {
	title: 'Context Menu',
	component: 'mo-field-context-menu',
	package: p,
} as Meta

const keyboardShortcut = (shortcut: string) => html`<span style='font-size: 13px; color: darkgray'>${shortcut}</span>`

const mainContextMenu = html`
	<mo-context-menu-item>
		<mo-icon style='opacity: 0.66' icon='content_cut'></mo-icon>
		<span style='flex: 1'>Cut</span>
		${keyboardShortcut('Ctrl + X')}
	</mo-context-menu-item>
	<mo-context-menu-item>
		<mo-icon style='opacity: 0.66' icon='content_copy'></mo-icon>
		<span style='flex: 1'>Copy</span>
		${keyboardShortcut('Ctrl + C')}
	</mo-context-menu-item>
	<mo-context-menu-item>
		<mo-icon style='opacity: 0.66' icon='content_paste'></mo-icon>
		<span style='flex: 1'>Paste</span>
		${keyboardShortcut('Ctrl + V')}
	</mo-context-menu-item>
	<div role='separator' style='width: 100%; height: 1px; background: darkgray; opacity: 0.3'></div>
	<mo-context-menu-item>Dictionary</mo-context-menu-item>
	<mo-context-menu-item>Thesaurus</mo-context-menu-item>
	<mo-context-menu-item>
		More
		<mo-context-menu-item slot='submenu'>Open in New</mo-context-menu-item>
		<mo-context-menu-item slot='submenu'>Report Issue</mo-context-menu-item>
		<mo-context-menu-item slot='submenu'>
			More
			<mo-context-menu-item slot='submenu'>Open in New</mo-context-menu-item>
			<mo-context-menu-item slot='submenu'>Report Issue</mo-context-menu-item>
		</mo-context-menu-item>
	</mo-context-menu-item>
`

const specialContextMenu = html`
	<mo-context-menu-item>
		<mo-icon style='opacity: 0.66' icon='auto_fix_normal'></mo-icon>
		<span style='flex: 1'>Another Item</span>
	</mo-context-menu-item>
`

export const ContextMenu: StoryObj = {
	render: () => html`
		<div ${contextMenu(() => mainContextMenu)} style='width: 100%; height: 300px; position: relative; display: flex; align-items: center; justify-content: center; border: dotted 2px currentColor; opacity: .7; border-radius: var(--mo-border-radius)'>
			Right click anywhere

			<div ${contextMenu(() => specialContextMenu)} style='position: absolute; top: 50px; left: 60px; width: 100px; height: 100px; border: dotted 2px red; display: flex; align-items: center; justify-content: center;'>Or here</div>
		</div>
	`
}