import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import focusTrackerSource from './stories/FocusTracker.ts?raw'
import './stories/FocusTracker.js'

export default {
	title: 'Behaviors / Focus Controller',
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 16px'>${story()}</div>`],
} satisfies Meta

/** Tab into the box, or click into it, and out again: the focus is reported as bubbled from a descendant, by keyboard or by pointer. */
export const Default: StoryObj = {
	parameters: sourceOf(focusTrackerSource),
	render: () => html`
		<story-focus-tracker>
			<mo-button type='outlined'>Focusable</mo-button>
			<div>Not focusable</div>
			<div tabindex='0'>Focusable</div>
		</story-focus-tracker>
		<mo-button type='outlined'>Outside</mo-button>
	`,
}

/** A host which takes the focus itself reports it as not bubbled. */
export const FocusedItself: StoryObj = {
	render: () => html`
		<story-focus-tracker tabindex='0'>Focusable box</story-focus-tracker>
	`,
}

/** Focus moved by `focus()` rather than by the user is reported as `programmatic`. */
export const Programmatic: StoryObj = {
	render: () => html`
		<mo-button type='outlined' @click=${(event: Event) => ((event.currentTarget as Element).nextElementSibling as HTMLElement).focus()}>Focus from script</mo-button>
		<story-focus-tracker tabindex='0'>Focusable box</story-focus-tracker>
	`,
}