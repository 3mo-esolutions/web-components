import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import { contextMenu } from './index.js'

export default meta({
	title: 'Core/ContextMenu',
	component: 'mo-field-context-menu',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

const keyboardShortcut = (shortcut: string) => html`<span style='font-size: 13px; color: darkgray'>${shortcut}</span>`

const mainContextMenu = html`
	<mo-list-item>
		<mo-icon style='opacity: 0.66' icon='content_cut'></mo-icon>
		<span style='flex: 1'>Cut</span>
		${keyboardShortcut('Ctrl + X')}
	</mo-list-item>
	<mo-list-item>
		<mo-icon style='opacity: 0.66' icon='content_copy'></mo-icon>
		<span style='flex: 1'>Copy</span>
		${keyboardShortcut('Ctrl + C')}
	</mo-list-item>
	<mo-list-item>
		<mo-icon style='opacity: 0.66' icon='content_paste'></mo-icon>
		<span style='flex: 1'>Paste</span>
		${keyboardShortcut('Ctrl + V')}
	</mo-list-item>
	<div role='separator' style='width: 100%; height: 1px; background: darkgray; opacity: 0.3'></div>
	<mo-list-item>Dictionary</mo-list-item>
	<mo-list-item>Thesaurus</mo-list-item>
	<mo-list-submenu>
		More
		<mo-list-item slot='detail'>Open in New</mo-list-item>
		<mo-list-item slot='detail'>Report Issue</mo-list-item>
		<mo-list-submenu slot='detail'>
			More
			<mo-list-item slot='detail'>Open in New</mo-list-item>
			<mo-list-item slot='detail'>Report Issue</mo-list-item>
		</mo-list-submenu>
	</mo-list-submenu>
`

const specialContextMenu = html`
	<mo-list-item>
		<mo-icon style='opacity: 0.66' icon='auto_fix_normal'></mo-icon>
		<span style='flex: 1'>Another Item</span>
	</mo-list-item>
`

export const ContextMenu = story({
	render: () => html`
		<div ${contextMenu(mainContextMenu)} style='width: 100%; height: 300px; position: relative; display: flex; align-items: center; justify-content: center; border: dotted 2px currentColor; opacity: .7; border-radius: var(--mo-border-radius)'>
			Right click anywhere

			<div ${contextMenu(specialContextMenu)} style='position: absolute; top: 50px; left: 60px; width: 100px; height: 100px; border: dotted 2px red; display: flex; align-items: center; justify-content: center;'>Or here</div>
		</div>
	`
})