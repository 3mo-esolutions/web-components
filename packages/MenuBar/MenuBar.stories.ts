import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import customMenuBarSource from './stories/CustomMenuBar.ts?raw'
import './stories/CustomMenuBar.js'
import './index.js'
import '@3mo/menu'
import '@3mo/line'

export default {
	title: 'Actions / Menu Bar',
	component: 'mo-menu-bar',
} satisfies Meta

type Story = StoryObj

/**
 * Once a menu is open, hovering or pressing the arrows opens its neighbours.
 * Home, End and typing a letter move the cursor without opening anything.
 */
export const Default: Story = {
	render: () => html`
		<mo-menu-bar aria-label='Editor'>
			<mo-menu-bar-item>
				File
				<mo-menu slot='menu'>
					<mo-menu-item icon='note_add'>New</mo-menu-item>
					<mo-menu-item icon='save'>Save</mo-menu-item>
					<mo-menu-item icon='print'>Print</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				Edit
				<mo-menu slot='menu'>
					<mo-menu-item icon='undo'>Undo</mo-menu-item>
					<mo-menu-item icon='redo'>Redo</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				Help
				<mo-menu slot='menu'>
					<mo-menu-item icon='help'>Documentation</mo-menu-item>
					<mo-menu-item icon='info'>About</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
		</mo-menu-bar>
	`,
}

/** The menus take what any `mo-menu` does: submenus, selectable items and separators. */
export const MenuContent: Story = {
	render: () => html`
		<mo-menu-bar aria-label='Editor'>
			<mo-menu-bar-item>
				File
				<mo-menu slot='menu'>
					<mo-menu-item icon='note_add'>New</mo-menu-item>
					<mo-nested-menu-item icon='folder_open'>
						Open recent
						<mo-menu-item slot='submenu'>Invoice 2026-08.pdf</mo-menu-item>
						<mo-menu-item slot='submenu'>Delivery notes.csv</mo-menu-item>
						<mo-menu-item slot='submenu'>Stock report.xlsx</mo-menu-item>
					</mo-nested-menu-item>
					<mo-line></mo-line>
					<mo-menu-item icon='save'>Save</mo-menu-item>
					<mo-menu-item icon='print'>Print</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				Edit
				<mo-menu slot='menu'>
					<mo-menu-item icon='undo'>Undo</mo-menu-item>
					<mo-menu-item icon='redo'>Redo</mo-menu-item>
					<mo-line></mo-line>
					<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
					<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
					<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				View
				<mo-menu slot='menu' selectability='multiple'>
					<mo-selectable-menu-item selected>Toolbar</mo-selectable-menu-item>
					<mo-selectable-menu-item>Status bar</mo-selectable-menu-item>
					<mo-line></mo-line>
					<mo-menu-item icon='zoom_in'>Zoom in</mo-menu-item>
					<mo-menu-item icon='zoom_out'>Zoom out</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
		</mo-menu-bar>
	`,
}

/** A disabled item fades and does not open its menu. */
export const Disabled: Story = {
	render: () => html`
		<mo-menu-bar aria-label='Editor'>
			<mo-menu-bar-item>
				File
				<mo-menu slot='menu'>
					<mo-menu-item icon='note_add'>New</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item disabled>
				Tools
				<mo-menu slot='menu'>
					<mo-menu-item>Nothing here yet</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				Help
				<mo-menu slot='menu'>
					<mo-menu-item icon='info'>About</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
		</mo-menu-bar>
	`,
}

/** Resize the container: menus that do not fit are hidden and skipped by the cursor, and `overflowChange` reports it. */
export const Overflow: Story = {
	render: () => html`
		<div style='resize: horizontal; overflow: hidden; max-width: 400px; min-width: 80px; padding: 4px; border: 1px dashed var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'>
			<mo-menu-bar aria-label='Editor'>
				${['File', 'Edit', 'Selection', 'View', 'Window', 'Help'].map(label => html`
					<mo-menu-bar-item>
						${label}
						<mo-menu slot='menu'>
							<mo-menu-item>${label} command</mo-menu-item>
						</mo-menu>
					</mo-menu-bar-item>
				`)}
			</mo-menu-bar>
		</div>
	`,
}

/** The `trigger` part of each item can be restyled from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			.caps mo-menu-bar-item::part(trigger) { text-transform: uppercase; font-weight: 500; letter-spacing: 0.05em; }
		</style>
		<mo-menu-bar class='caps' aria-label='Editor'>
			<mo-menu-bar-item>
				File
				<mo-menu slot='menu'>
					<mo-menu-item icon='note_add'>New</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
			<mo-menu-bar-item>
				Edit
				<mo-menu slot='menu'>
					<mo-menu-item icon='undo'>Undo</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
		</mo-menu-bar>
	`,
}

/** `MenuBarController` applies the pattern to items of your own, here plain buttons rendered by a custom component. */
export const WithController: Story = {
	parameters: sourceOf(customMenuBarSource),
	render: () => html`<story-custom-menu-bar></story-custom-menu-bar>`,
}