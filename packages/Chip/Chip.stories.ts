import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Button/Chip',
	component: 'mo-chip',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Chip = story({
	render: () => html`
		<mo-chip>Chip</mo-chip>
		<mo-chip>
			<mo-icon-button dense slot='leading' icon='calendar_today'></mo-icon-button>
			With Leading Icon
		</mo-chip>
		<mo-chip>
			With Trailing Icon
			<mo-icon-button dense slot='trailing' icon='delete'></mo-icon-button>
		</mo-chip>
	`
})