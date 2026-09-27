import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import popoverMenuSource from './stories/PopoverMenu.ts?raw'
import './stories/PopoverMenu.js'

export default {
	title: 'Behaviors / Menu Controller',
	parameters: { controller: 'MenuController' },
	decorators: [story => html`<div style='min-block-size: 18rem'>${story()}</div>`],
} satisfies Meta

/**
 * ↓, ↑, Home or End on the button opens the menu onto the first or last item; a click opens it with none active. Inside, the arrows wrap,
 * typing finds, and Enter, Space, Esc, Tab or a press outside close it. For a menu that is not `mo-menu`, which does all this itself.
 */
export const Default: StoryObj = {
	parameters: sourceOf(popoverMenuSource),
	render: () => html`
		<button id='edit-menu-button'>Actions</button>
		<story-popover-menu target='edit-menu-button'>
			<div>Cut</div>
			<div>Copy</div>
			<div>Paste</div>
			<div disabled>Paste as plain text</div>
			<div>Select all</div>
			<div>Find</div>
		</story-popover-menu>
	`,
}

/** `selectability` announces items carrying their own `selected` as `menuitemradio` or `menuitemcheckbox`, and opening lands on the selected one. */
export const SelectableItems: StoryObj = {
	render: () => html`
		<button id='sort-menu-button'>Sort by</button>
		<story-popover-menu target='sort-menu-button' selectability='single'>
			<mo-selectable-menu-item>Name</mo-selectable-menu-item>
			<mo-selectable-menu-item>Date modified</mo-selectable-menu-item>
			<mo-selectable-menu-item>Size</mo-selectable-menu-item>
		</story-popover-menu>
	`,
}