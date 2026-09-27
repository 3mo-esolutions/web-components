import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { createRef, html, ref } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import type { Tree } from './Tree.js'
import type { TreeItem } from './TreeItem.js'
import { fileSystem } from './stories/fileSystem.js'
import headlessTreeSource from './stories/HeadlessTree.ts?raw'
import './stories/HeadlessTree.js'
import './index.js'

type Args = {
	readonly selectability?: 'single' | 'multiple'
}

export default {
	title: 'Data / Tree',
	component: 'mo-tree',
	args: {
		selectability: undefined,
	},
	argTypes: {
		selectability: { control: 'select', options: [undefined, 'single', 'multiple'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ selectability }) => html`
		<mo-tree selectability=${selectability ?? ''} style='max-width: 24rem'>
			<mo-tree-item value='documents' icon='folder'>
				Documents
				<mo-tree-item value='taxes' icon='folder'>
					Taxes
					<mo-tree-item value='2025.pdf' icon='picture_as_pdf'>2025.pdf</mo-tree-item>
					<mo-tree-item value='2026.pdf' icon='picture_as_pdf'>2026.pdf</mo-tree-item>
				</mo-tree-item>
				<mo-tree-item value='notes.md' icon='description'>Notes.md</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='pictures' icon='folder'>
				Pictures
				<mo-tree-item value='beach.jpg' icon='image'>Beach.jpg</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='readme.txt' icon='description'>Readme.txt</mo-tree-item>
		</mo-tree>
	`,
}

/** Without `selectability` a click opens a row; with `single` or `multiple` it selects, and the chevron opens. The tree reports the selection as the `value` of its items. */
export const Selection: Story = {
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2rem'>${story()}</div>`],
	render: () => html`
		<mo-tree selectability='single' style='width: 18rem'>
			<mo-tree-item value='documents' icon='folder' open>
				Documents
				<mo-tree-item value='taxes' icon='folder'>Taxes</mo-tree-item>
				<mo-tree-item value='notes.md' icon='description'>Notes.md</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='readme.txt' icon='description'>Readme.txt</mo-tree-item>
		</mo-tree>
		<mo-tree selectability='multiple' style='width: 18rem'>
			<mo-tree-item value='documents' icon='folder' open>
				Documents
				<mo-tree-item value='taxes' icon='folder'>Taxes</mo-tree-item>
				<mo-tree-item value='notes.md' icon='description'>Notes.md</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='readme.txt' icon='description'>Readme.txt</mo-tree-item>
		</mo-tree>
	`,
}

/** An item's `open` and `selected` set where it starts, and a `disabled` one is neither selected nor reached by the keyboard. */
export const InitialState: Story = {
	render: () => html`
		<mo-tree selectability='multiple' style='max-width: 24rem'>
			<mo-tree-item value='documents' icon='folder' open>
				Documents
				<mo-tree-item value='taxes' icon='folder' open>
					Taxes
					<mo-tree-item value='2025.pdf' icon='picture_as_pdf' selected>2025.pdf</mo-tree-item>
					<mo-tree-item value='2026.pdf' icon='picture_as_pdf' selected>2026.pdf</mo-tree-item>
				</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='system' icon='folder' disabled>
				System
				<mo-tree-item value='kernel' icon='description'>kernel</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='readme.txt' icon='description'>Readme.txt</mo-tree-item>
		</mo-tree>
	`,
}

/** The selection is the tree's `value` and what is open each item's own `open`, both held in state here. `openChange` bubbles, so one listener on the tree hears every item. */
export const Controlled: Story = {
	render: () => {
		const [value, setValue] = useState<string | Array<string> | undefined>(undefined)
		const [open, setOpen] = useState(['documents'])
		return html`
			<mo-tree selectability='multiple' style='max-width: 24rem'
				.value=${value}
				@change=${(event: CustomEvent<string | Array<string>>) => setValue(event.detail)}
				@openChange=${(event: CustomEvent<boolean>) => {
					const item = (event.target as TreeItem).value!
					setOpen(event.detail ? [...open, item] : open.filter(folder => folder !== item))
				}}
			>
				<mo-tree-item value='documents' icon='folder' ?open=${open.includes('documents')}>
					Documents
					<mo-tree-item value='taxes' icon='folder'>Taxes</mo-tree-item>
					<mo-tree-item value='letters' icon='folder'>Letters</mo-tree-item>
				</mo-tree-item>
				<mo-tree-item value='pictures' icon='folder' ?open=${open.includes('pictures')}>
					Pictures
					<mo-tree-item value='holidays' icon='folder'>Holidays</mo-tree-item>
				</mo-tree-item>
				<mo-tree-item value='music' icon='folder'>Music</mo-tree-item>
			</mo-tree>
		`
	},
}

/** `expandAll()`, `collapseAll()`, `selectAll()` and `deselectAll()` act on the whole tree, and `reveal()` opens the way to an item. */
export const Methods: Story = {
	render: () => {
		const tree = createRef<Tree>()
		return html`
			<mo-flex gap='12px' style='max-width: 24rem'>
				<mo-flex direction='horizontal' gap='8px' wrap='wrap'>
					<mo-button @click=${() => tree.value?.expandAll()}>Expand all</mo-button>
					<mo-button @click=${() => tree.value?.collapseAll()}>Collapse all</mo-button>
					<mo-button @click=${() => tree.value?.selectAll()}>Select all</mo-button>
					<mo-button @click=${() => tree.value?.deselectAll()}>Deselect all</mo-button>
					<mo-button @click=${() => tree.value?.reveal('mountains.jpg')}>Reveal Mountains.jpg</mo-button>
				</mo-flex>
				<mo-tree selectability='multiple' ${ref(tree)}>${fileSystem}</mo-tree>
			</mo-flex>
		`
	},
}

/** `icon` takes a Material icon, which the `start` slot replaces; the `end` slot places content after the label. */
export const Slots: Story = {
	render: () => html`
		<mo-tree style='max-width: 24rem'>
			<mo-tree-item value='inbox' icon='inbox' open>
				Inbox
				<span slot='end' style='color: var(--mo-color-gray); font-size: small'>12</span>
				<mo-tree-item value='work'>
					<span slot='start' style='width: 10px; height: 10px; border-radius: 50%; background: var(--mo-color-accent)'></span>
					Work
					<span slot='end' style='color: var(--mo-color-gray); font-size: small'>9</span>
				</mo-tree-item>
				<mo-tree-item value='family'>
					<span slot='start' style='width: 10px; height: 10px; border-radius: 50%; background: var(--mo-color-green)'></span>
					Family
					<span slot='end' style='color: var(--mo-color-gray); font-size: small'>3</span>
				</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='sent' icon='send'>Sent</mo-tree-item>
		</mo-tree>
	`,
}

/** A label that does not fit is truncated with an ellipsis. */
export const Overflow: Story = {
	render: () => html`
		<mo-tree style='max-width: 16rem'>
			<mo-tree-item value='reports' icon='folder' open>
				Reports
				<mo-tree-item value='report' icon='description'>Quarterly report on the regional sales of the second half.pdf</mo-tree-item>
			</mo-tree-item>
		</mo-tree>
	`,
}

/** Arrows move and open, Home and End jump, `*` opens every sibling, Space selects, Shift+arrows extend, Ctrl+A selects all and typing jumps to a matching item. */
export const Keyboard: Story = {
	render: () => html`
		<mo-tree selectability='multiple' style='max-width: 24rem'>${fileSystem}</mo-tree>
	`,
}

/** `::part(row)` sets a row's height, indentation and guide lines, and `::part(group)` the slide of the nested items: the default, a dense tree, and one without guides or motion. */
export const Parts: Story = {
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2rem'>${story()}</div>`],
	render: () => html`
		<style>
			.dense mo-tree-item::part(row) {
				min-block-size: 32px;
				padding-inline-start: calc(var(--mo-tree-level, 0) * 28px);
				background-size: calc(var(--mo-tree-level, 0) * 28px) 100%;
			}

			.plain mo-tree-item::part(row) {
				background-image: none;
			}

			.plain mo-tree-item::part(group) {
				transition: none;
			}
		</style>
		<mo-tree style='width: 18rem'>${fileSystem}</mo-tree>
		<mo-tree class='dense' style='width: 18rem'>${fileSystem}</mo-tree>
		<mo-tree class='plain' style='width: 18rem'>${fileSystem}</mo-tree>
	`,
}

/** `TreeController` alone, on plain `div`s: the host supplies the roots and their children, and hides a closed item's children itself. */
export const Controller: Story = {
	parameters: sourceOf(headlessTreeSource),
	render: () => html`<story-headless-tree></story-headless-tree>`,
}