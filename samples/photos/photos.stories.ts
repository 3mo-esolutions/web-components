import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Demo / Photos',
	package: p,
} as Meta

export const Photos: StoryObj = {
	render: () => html`<photos-application></photos-application>`
}