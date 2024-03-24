import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Floating Action Button Group',
	component: 'mo-fab-group',
	package: p,
} as Meta

export const FloatingActionButtonGroup: StoryObj = {
	render: () => html`
		<div ${style({ display: 'block', height: '300px' })}>
			<mo-fab-group ${style({ position: 'absolute', right: '16px', bottom: '16px' })}>
				<mo-fab icon='add'>Add</mo-fab>
				<mo-fab icon='publish'>Import</mo-fab>
				<mo-fab icon='share'>Share</mo-fab>
			</mo-fab-group>
		</div>
	`
}