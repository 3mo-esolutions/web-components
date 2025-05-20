import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Utilities / Focus Ring',
	component: 'mo-focus-ring',
	package: p,
	decorators: [story => html`
		<div tabindex='0' style='position: relative; border: 1px solid var(--mo-color-transparent-gray); padding: 10px; outline: none !important;'>
			Focus this element by pressing the tab key to see the focus ring.
			${story()}
		</div>
	`]
} as Meta

export const FocusRing: StoryObj = {
	render: () => html`<mo-focus-ring></mo-focus-ring>`
}

export const Inward: StoryObj = {
	render: () => html`<mo-focus-ring inward></mo-focus-ring>`
}