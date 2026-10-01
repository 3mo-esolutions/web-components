import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { contextMenu } from './index.js'

export default {
	title: 'Actions / Context Menu',
	component: 'mo-context-menu',
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
	render: () => html`
		<div style='display: inline-flex; align-items: center; gap: 8px; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'
			${contextMenu(() => html`
				<mo-context-menu-item icon='open_in_new'>Open</mo-context-menu-item>
				<mo-context-menu-item icon='edit'>Rename</mo-context-menu-item>
				<mo-context-menu-item icon='delete'>Delete</mo-context-menu-item>
			`)}
		>
			<mo-icon icon='description'></mo-icon>
			Invoice 2026-08.pdf
		</div>
	`,
}

/** Items take any content, such as a shortcut hint after a label that fills the row, and `mo-line` separates groups. */
export const ItemContent: Story = {
	render: () => html`
		<div style='padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'
			${contextMenu(() => html`
				<mo-context-menu-item icon='content_cut'>
					Cut
					<span slot='end' style='font-size: 13px; opacity: 0.6'>Ctrl + X</span>
				</mo-context-menu-item>
				<mo-context-menu-item icon='content_copy'>
					Copy
					<span slot='end' style='font-size: 13px; opacity: 0.6'>Ctrl + C</span>
				</mo-context-menu-item>
				<mo-context-menu-item icon='content_paste'>
					Paste
					<span slot='end' style='font-size: 13px; opacity: 0.6'>Ctrl + V</span>
				</mo-context-menu-item>
				<mo-line></mo-line>
				<mo-context-menu-item>Dictionary</mo-context-menu-item>
				<mo-context-menu-item>Thesaurus</mo-context-menu-item>
			`)}
		>
			The quick brown fox jumps over the lazy dog.
		</div>
	`,
}

/** Items in the `submenu` slot of an item open beside it, on hover or with ArrowRight, and nest further. */
export const Submenus: Story = {
	render: () => html`
		<div style='padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'
			${contextMenu(() => html`
				<mo-context-menu-item icon='open_in_new'>Open</mo-context-menu-item>
				<mo-context-menu-item icon='share'>
					Share
					<mo-context-menu-item slot='submenu'>Email</mo-context-menu-item>
					<mo-context-menu-item slot='submenu'>Link</mo-context-menu-item>
					<mo-context-menu-item slot='submenu'>
						More
						<mo-context-menu-item slot='submenu'>Print</mo-context-menu-item>
						<mo-context-menu-item slot='submenu'>Report issue</mo-context-menu-item>
					</mo-context-menu-item>
				</mo-context-menu-item>
			`)}
		>
			Quarterly report
		</div>
	`,
}

/** Areas nest: a right-click opens the menu of the innermost one, and opening one menu closes any other. */
export const NestedAreas: Story = {
	render: () => html`
		<div style='height: 240px; padding: 16px; border: 1px dashed var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'
			${contextMenu(() => html`
				<mo-context-menu-item icon='create_new_folder'>New folder</mo-context-menu-item>
				<mo-context-menu-item icon='content_paste'>Paste</mo-context-menu-item>
			`)}
		>
			<div style='display: inline-flex; align-items: center; gap: 8px; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius); background: var(--mo-color-surface)'
				${contextMenu(() => html`
					<mo-context-menu-item icon='open_in_new'>Open</mo-context-menu-item>
					<mo-context-menu-item icon='edit'>Rename</mo-context-menu-item>
					<mo-context-menu-item icon='delete'>Delete</mo-context-menu-item>
				`)}
			>
				<mo-icon icon='description'></mo-icon>
				Invoice 2026-08.pdf
			</div>
		</div>
	`,
}