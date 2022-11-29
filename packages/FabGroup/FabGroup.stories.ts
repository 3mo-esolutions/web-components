import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Button/Floating Action Button Group',
	component: 'mo-fab-group',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const FloatingActionButtonGroup = story({
	render: () => html`
		<div ${style({ display: 'block', height: '300px' })}>
			<mo-fab-group icon='add' ${style({ position: 'absolute', right: '16px', bottom: '16px' })}>
				<mo-fab icon='add'>Add</mo-fab>
				<mo-fab icon='publish'>Import</mo-fab>
				<mo-fab icon='share'>Share</mo-fab>
			</mo-fab-group>
		</div>
	`
})