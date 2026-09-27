import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import viewportLayoutSource from './stories/ViewportLayout.ts?raw'
import userPreferencesSource from './stories/UserPreferences.ts?raw'
import './stories/ViewportLayout.js'
import './stories/UserPreferences.js'

export default {
	title: 'Behaviors / Media Query Observer',
} satisfies Meta

/** `matches` tells whether the query holds, and the host re-renders when that changes. Narrow the viewport below 600 pixels and the panes stack. */
export const Default: StoryObj = {
	parameters: sourceOf(viewportLayoutSource),
	render: () => html`<story-viewport-layout></story-viewport-layout>`,
}

/** One controller per query. Switch the operating system to dark mode or reduced motion and the readout follows. */
export const UserPreferences: StoryObj = {
	parameters: sourceOf(userPreferencesSource),
	render: () => html`<story-user-preferences></story-user-preferences>`,
}