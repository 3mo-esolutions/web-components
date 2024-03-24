import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'SplitButton',
	component: 'mo-split-button',
	package: p,
} as Meta

export const SplitButton: StoryObj = {
	render: () => html`
		<mo-split-button>
			<mo-button leadingIcon='merge'>Merge</mo-button>
			<mo-list-item slot='more'>Squash & merge</mo-list-item>
			<mo-list-item slot='more'>Rebase & merge</mo-list-item>
		</mo-split-button>
	`
}