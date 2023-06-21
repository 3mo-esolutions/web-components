import { html } from '@a11d/lit'
import { meta, story } from '../../.storybook/story.js'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Toolbar',
	component: 'mo-toolbar',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	},
})

export const Default = story({
	render: () => html`
		<mo-toolbar-pane>
			<mo-menu-item icon='content_cut'>
				<span>Cut</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
		</mo-toolbar-pane>
	`
})