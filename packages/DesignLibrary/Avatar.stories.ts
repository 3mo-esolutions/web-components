import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Unreleased / Avatar',
	component: 'mo-avatar',
	package: p,
} as Meta

export const Avatar: StoryObj = {
	render: () => html`<mo-avatar>AZ</mo-avatar>`
}