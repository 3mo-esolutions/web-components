import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import tileSource from './stories/Tile.ts?raw'
import './stories/Tile.js'

export default {
	title: 'Utilities / Disabled Property',
	decorators: [story => html`<mo-flex direction='horizontal' gap='8px' alignItems='center'>${story()}</mo-flex>`],
} satisfies Meta

/** The decorated `disabled` property reflects to an attribute and sets `aria-disabled`. */
export const Default: StoryObj = {
	parameters: sourceOf(tileSource),
	render: () => html`
		<story-tile>Enabled</story-tile>
		<story-tile disabled>Disabled</story-tile>
	`,
}

/** With `blockFocus`, a disabled element leaves the tab order and gets its `tabindex` back once enabled. Disable the middle tile and tab through them. */
export const BlockFocus: StoryObj = {
	render: () => {
		const [disabled, setDisabled] = useState(false)
		return html`
			<mo-switch label='Disabled' ?selected=${disabled} @change=${(event: CustomEvent<boolean>) => setDisabled(event.detail)}></mo-switch>
			<story-tile>First</story-tile>
			<story-tile ?disabled=${disabled}>Second</story-tile>
			<story-tile>Third</story-tile>
		`
	},
}
