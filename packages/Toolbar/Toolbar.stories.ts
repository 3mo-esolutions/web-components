import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { MaterialIcon } from '@3mo/icon'
import { sourceOf } from '../../.storybook/source.js'
import splitToolbarSource from './stories/SplitToolbar.ts?raw'
import './stories/SplitToolbar.js'
import './index.js'

type Args = {
	readonly collapsed: boolean
	readonly overflowIcon: MaterialIcon
	readonly overflowPosition: 'start' | 'end'
}

export default {
	title: 'Layout / Toolbar',
	component: 'mo-toolbar',
	args: {
		collapsed: false,
		overflowIcon: 'more_vert',
		overflowPosition: 'end',
	},
	argTypes: {
		overflowPosition: { control: 'inline-radio', options: ['start', 'end'] },
	},
	decorators: [story => html`<div style='resize: horizontal; overflow: hidden; min-width: 100px; padding: 4px; border: 1px dashed var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

/** Items that no longer fit move into the overflow menu - drag the dashed box's corner to resize it. They stay the same elements, with their state and listeners. */
export const Default: Story = {
	render: ({ collapsed, overflowIcon, overflowPosition }) => html`
		<mo-toolbar ?collapsed=${collapsed} overflowIcon=${overflowIcon} overflowPosition=${overflowPosition}>
			<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
			<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
			<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
			<mo-menu-item icon='format_bold'>Bold</mo-menu-item>
			<mo-menu-item icon='format_italic'>Italic</mo-menu-item>
			<mo-menu-item icon='format_underlined'>Underline</mo-menu-item>
			<mo-menu-item icon='insert_link'>Link</mo-menu-item>
			<mo-menu-item icon='image'>Image</mo-menu-item>
		</mo-toolbar>
	`,
}

/** An item with `data-no-overflow` never moves into the menu: "Save" stays however narrow the toolbar gets. */
export const PinnedItems: Story = {
	render: () => html`
		<mo-toolbar>
			<mo-menu-item icon='save' data-no-overflow>Save</mo-menu-item>
			<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
			<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
			<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
			<mo-menu-item icon='format_bold'>Bold</mo-menu-item>
			<mo-menu-item icon='format_italic'>Italic</mo-menu-item>
		</mo-toolbar>
	`,
}

/** `collapsed` puts every item into the menu, leaving only its button. */
export const Collapsed: Story = {
	render: () => html`
		<mo-toolbar collapsed>
			<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
			<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
			<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
		</mo-toolbar>
	`,
}

/** `overflowPosition='start'` puts the menu button before the items, and `overflowIcon` changes its icon. */
export const OverflowButton: Story = {
	render: () => html`
		<mo-toolbar overflowPosition='start' overflowIcon='menu'>
			<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
			<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
			<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
			<mo-menu-item icon='format_bold'>Bold</mo-menu-item>
			<mo-menu-item icon='format_italic'>Italic</mo-menu-item>
			<mo-menu-item icon='format_underlined'>Underline</mo-menu-item>
		</mo-toolbar>
	`,
}

/** The `pane` and `overflow-icon` parts can be styled from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			#styled-toolbar::part(pane) {
				gap: 8px;
			}

			#styled-toolbar::part(overflow-icon) {
				color: var(--mo-color-accent);
			}
		</style>
		<mo-toolbar id='styled-toolbar'>
			<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
			<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
			<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
			<mo-menu-item icon='format_bold'>Bold</mo-menu-item>
			<mo-menu-item icon='format_italic'>Italic</mo-menu-item>
		</mo-toolbar>
	`,
}

/** `ToolbarController` moves items between any pane slot and overflow slot of your own component; here two panes share one list. */
export const WithController: Story = {
	parameters: sourceOf(splitToolbarSource),
	render: () => html`
		<story-split-toolbar>
			<mo-menu-item icon='arrow_circle_left' slot='left'>Left 1</mo-menu-item>
			<mo-menu-item icon='arrow_circle_left' slot='left'>Left 2</mo-menu-item>
			<mo-menu-item icon='arrow_circle_left' slot='left'>Left 3</mo-menu-item>
			<mo-menu-item icon='arrow_circle_left' slot='left'>Left 4</mo-menu-item>
			<mo-menu-item icon='arrow_circle_right' slot='right'>Right 1</mo-menu-item>
			<mo-menu-item icon='arrow_circle_right' slot='right'>Right 2</mo-menu-item>
			<mo-menu-item icon='arrow_circle_right' slot='right'>Right 3</mo-menu-item>
			<mo-menu-item icon='arrow_circle_right' slot='right'>Right 4</mo-menu-item>
		</story-split-toolbar>
	`,
}