import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Buttons & Actions / Split Button',
	component: 'mo-split-button',
	package: p,
} as Meta

export const SplitButton: StoryObj = {
	render: () => html`
		<mo-split-button>
			<mo-button startIcon='merge'>Merge</mo-button>
			<mo-list-item slot='more'>Squash & merge</mo-list-item>
			<mo-list-item slot='more'>Rebase & merge</mo-list-item>
		</mo-split-button>
	`
}