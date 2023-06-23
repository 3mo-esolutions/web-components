import { meta, story } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import { MaterialIcon } from '@3mo/icon'
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
	args: {
		collapsed: false,
		extraItems: 5,
		overflowIcon: 'more_vert' as MaterialIcon,
		overflowPosition: 'end' as ('end' | 'start'),
	},
	argTypes: {
		collapsed: {
			control: { type: 'boolean' }
		},
		extraItems: {
			control: { type: 'number' }
		},
		overflowPosition: {
			control: { type: 'radio' },
			options: [ 'start', 'end' ]
		}
	},
	render: ({ collapsed, extraItems, overflowIcon, overflowPosition }) => html`
		<mo-toolbar ?collapsed=${collapsed} overflowIcon=${overflowIcon} overflowPosition=${overflowPosition}>
			<mo-menu-item icon='content_cut'>
				<span>Cut</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste'>
				<span>Paste</span>
			</mo-menu-item>
			${[...Array(extraItems).keys()].map(i => html`
				<mo-menu-item icon='category'>
					<span>Item ${i + 1}</span>
				</mo-menu-item>
			`)}
		</mo-toolbar>
	`
})