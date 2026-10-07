import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import buttonWithMenuSource from './stories/ButtonWithMenu.ts?raw'
import './stories/ButtonWithMenu.js'
import './index.js'

export default {
	title: 'Actions / Menu',
	component: 'mo-menu',
	decorators: [story => html`<div style='height: 320px; display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px'>${story()}</div>`],
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
	render: () => html`
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>Actions</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item icon='edit'>Rename</mo-menu-item>
				<mo-menu-item icon='content_copy'>Duplicate</mo-menu-item>
				<mo-menu-item icon='delete'>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** The `placement` of the container puts the menu on any side of its anchor, and flips it where there is no room. */
export const Placements: Story = {
	decorators: [story => html`<div style='height: 320px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px'>${story()}</div>`],
	render: () => html`
		<mo-popover-container placement='block-start'>
			<mo-button type='outlined'>Block start</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item>Rename</mo-menu-item>
				<mo-menu-item>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
		<mo-popover-container placement='block-end'>
			<mo-button type='outlined'>Block end</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item>Rename</mo-menu-item>
				<mo-menu-item>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
		<mo-popover-container placement='inline-start'>
			<mo-button type='outlined'>Inline start</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item>Rename</mo-menu-item>
				<mo-menu-item>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
		<mo-popover-container placement='inline-end'>
			<mo-button type='outlined'>Inline end</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item>Rename</mo-menu-item>
				<mo-menu-item>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** The `alignment` of the container lines the menu up with the start, the center or the end of its anchor. */
export const Alignments: Story = {
	decorators: [story => html`<div style='height: 320px; display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: center; gap: 16px'>${story()}</div>`],
	render: () => html`
		<mo-popover-container alignment='start'>
			<mo-button type='outlined' style='width: 200px'>Start</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item>Rename</mo-menu-item>
				<mo-menu-item>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
		<mo-popover-container alignment='center'>
			<mo-button type='outlined' style='width: 200px'>Center</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item>Rename</mo-menu-item>
				<mo-menu-item>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
		<mo-popover-container alignment='end'>
			<mo-button type='outlined' style='width: 200px'>End</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item>Rename</mo-menu-item>
				<mo-menu-item>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** Items take any content, such as a shortcut hint after a label that fills the row; `mo-line` separates groups. */
export const ItemContent: Story = {
	render: () => html`
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>Edit</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item icon='content_cut'>
					<span style='flex: 1'>Cut</span>
					<span style='font-size: 13px; opacity: 0.6'>Ctrl + X</span>
				</mo-menu-item>
				<mo-menu-item icon='content_copy'>
					<span style='flex: 1'>Copy</span>
					<span style='font-size: 13px; opacity: 0.6'>Ctrl + C</span>
				</mo-menu-item>
				<mo-menu-item icon='content_paste'>
					<span style='flex: 1'>Paste</span>
					<span style='font-size: 13px; opacity: 0.6'>Ctrl + V</span>
				</mo-menu-item>
				<mo-line></mo-line>
				<mo-menu-item>Dictionary</mo-menu-item>
				<mo-menu-item>Thesaurus</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** A `mo-nested-menu-item` opens the items in its `submenu` slot beside it, on hover or with ArrowRight; without any it is a plain item. */
export const Submenus: Story = {
	render: () => html`
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>File</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item icon='note_add'>New</mo-menu-item>
				<mo-nested-menu-item icon='share'>
					Share
					<mo-menu-item slot='submenu'>Email</mo-menu-item>
					<mo-menu-item slot='submenu'>Link</mo-menu-item>
					<mo-nested-menu-item slot='submenu'>
						More
						<mo-menu-item slot='submenu'>Print</mo-menu-item>
						<mo-menu-item slot='submenu'>Report issue</mo-menu-item>
					</mo-nested-menu-item>
				</mo-nested-menu-item>
				<mo-nested-menu-item icon='history'>No submenu</mo-nested-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** `mo-selectable-menu-item`s keep a selection: one at a time with `selectability='single'`, any number by default. */
export const Selection: Story = {
	render: () => html`
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>Visibility</mo-button>
			<mo-menu slot='popover' selectability='single'>
				<mo-selectable-menu-item icon='lock' selected>Private</mo-selectable-menu-item>
				<mo-selectable-menu-item icon='groups'>Team</mo-selectable-menu-item>
				<mo-selectable-menu-item icon='public'>Public</mo-selectable-menu-item>
			</mo-menu>
		</mo-popover-container>
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>View</mo-button>
			<mo-menu slot='popover'>
				<mo-selectable-menu-item selected>Toolbar</mo-selectable-menu-item>
				<mo-selectable-menu-item selected>Status bar</mo-selectable-menu-item>
				<mo-selectable-menu-item>Minimap</mo-selectable-menu-item>
				<mo-line></mo-line>
				<mo-menu-item icon='zoom_in'>Zoom in</mo-menu-item>
				<mo-menu-item icon='zoom_out'>Zoom out</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** A disabled item ignores presses, and a disabled menu does not open. */
export const Disabled: Story = {
	render: () => html`
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>Actions</mo-button>
			<mo-menu slot='popover'>
				<mo-menu-item icon='edit'>Rename</mo-menu-item>
				<mo-menu-item icon='content_copy' disabled>Duplicate</mo-menu-item>
				<mo-menu-item icon='delete'>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>Disabled menu</mo-button>
			<mo-menu slot='popover' disabled>
				<mo-menu-item icon='edit'>Rename</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** `target` names the element inside the anchor that opens the menu; here only the icon-button does. */
export const Target: Story = {
	render: () => html`
		<mo-popover-container placement='block-end' alignment='end'>
			<mo-button type='outlined'>
				Invoice 2026-08.pdf
				<mo-icon-button id='more' slot='end' icon='more_vert' dense></mo-icon-button>
			</mo-button>
			<mo-menu slot='popover' target='more'>
				<mo-menu-item icon='download'>Download</mo-menu-item>
				<mo-menu-item icon='delete'>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}

/** Without a container, `anchor` is set as a property, here by a component of your own that renders the button and its menu. */
export const Anchor: Story = {
	parameters: sourceOf(buttonWithMenuSource),
	render: () => html`<story-button-with-menu></story-button-with-menu>`,
}

/** A `manual` menu opens only through `open` and stays open on a press outside; bind `open` and `openChange` to keep the state. */
export const Manual: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-popover-container>
				<mo-button type='outlined' @click=${() => setOpen(!open)}>${open ? 'Close' : 'Open'}</mo-button>
				<mo-menu slot='popover' manual ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
					<mo-menu-item icon='edit'>Rename</mo-menu-item>
					<mo-menu-item icon='delete'>Delete</mo-menu-item>
				</mo-menu>
			</mo-popover-container>
		`
	},
}

/** The `popover` and `list` parts can be restyled from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			.rounded::part(popover) { border-radius: 16px; }
			.rounded::part(list) { min-width: 240px; }
		</style>
		<mo-popover-container>
			<mo-button type='outlined' endIcon='expand_more'>Actions</mo-button>
			<mo-menu slot='popover' class='rounded'>
				<mo-menu-item icon='edit'>Rename</mo-menu-item>
				<mo-menu-item icon='delete'>Delete</mo-menu-item>
			</mo-menu>
		</mo-popover-container>
	`,
}
