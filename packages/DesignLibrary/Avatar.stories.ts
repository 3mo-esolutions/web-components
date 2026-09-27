import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Data / Avatar',
	tags: ['status:preview'],
	component: 'mo-avatar',
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`<mo-avatar>AZ</mo-avatar>`,
}

/** An icon takes the place of the initials, for someone unknown or for a group. */
export const Icon: StoryObj = {
	render: () => html`
		<mo-avatar>
			<mo-icon icon='person'></mo-icon>
		</mo-avatar>
		<mo-avatar>
			<mo-icon icon='group'></mo-icon>
		</mo-avatar>
	`,
}

/** The circle is 40px by default; its own `width`, `height` and `font-size` resize it. */
export const Sizes: StoryObj = {
	render: () => html`
		<mo-avatar style='width: 24px; height: 24px; font-size: small'>AZ</mo-avatar>
		<mo-avatar>AZ</mo-avatar>
		<mo-avatar style='width: 64px; height: 64px; font-size: x-large'>AZ</mo-avatar>
	`,
}

/** The accent color fills the circle unless its own `background` and `color` replace it. */
export const Colors: StoryObj = {
	render: () => html`
		<mo-avatar style='background: var(--mo-color-green); color: white'>GH</mo-avatar>
		<mo-avatar style='background: var(--mo-color-red); color: white'>KT</mo-avatar>
		<mo-avatar style='background: var(--mo-color-surface-container-high)'>ML</mo-avatar>
	`,
}