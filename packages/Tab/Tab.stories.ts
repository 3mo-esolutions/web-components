import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Tab',
	component: 'mo-tab',
	argTypes: {
		value: { control: { type: 'select', options: ['tab-1', 'tab-2', 'tab-3', 'tab-4'] } },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Tab = story({
	args: { value: 'tab-1' },
	render: ({ value }) => html`
		<mo-tab-bar value=${value}>
			<mo-tab label='Tab 1' value='tab-1'></mo-tab>
			<mo-tab label='Tab 2' value='tab-2'></mo-tab>
			<mo-tab label='Tab 3' value='tab-3'></mo-tab>
			<mo-tab label='Tab 4' value='tab-4'></mo-tab>
		</mo-tab-bar>
	`
})