import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import badgeSource from './stories/Badge.ts?raw'
import './stories/Badge.js'

export default {
	title: 'Behaviors / Instanceof Attribute Controller',
	decorators: [story => html`<mo-flex direction='horizontal' gap='8px'>${story()}</mo-flex>`],
} satisfies Meta

/** The attribute lists the tag of the element's class and of every custom element class it extends. */
export const Default: StoryObj = {
	parameters: sourceOf(badgeSource),
	render: () => html`
		<story-badge>Badge</story-badge>
		<story-warning-badge>Warning</story-warning-badge>
	`,
}

/** `[instanceof~=story-badge]` matches the badge and every subclass, where a tag selector matches only one. */
export const Selector: StoryObj = {
	render: () => html`
		<style>
			@scope {
				[instanceof~='story-badge'] { outline: 2px solid var(--mo-color-accent); }
			}
		</style>
		<story-badge>Badge</story-badge>
		<story-warning-badge>Warning</story-warning-badge>
	`,
}