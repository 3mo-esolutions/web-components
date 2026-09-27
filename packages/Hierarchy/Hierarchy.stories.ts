import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import folderTreeSource from './stories/FolderTree.ts?raw'
import './stories/FolderTree.js'

export default {
	title: 'Utilities / Hierarchy',
} satisfies Meta

/** `visible()` lists the roots and the children of expanded nodes in pre-order, each with the level, position and set size ARIA asks for. Click a folder to expand it. */
export const Default: StoryObj = {
	parameters: sourceOf(folderTreeSource),
	render: () => html`<story-folder-tree></story-folder-tree>`,
}

/** `filter()` keeps the matches, their ancestors and their subtrees; passed as `isIncluded`, it prunes what is visible. Type "inv". */
export const Filtering: StoryObj = {
	render: () => html`<story-folder-tree searchable></story-folder-tree>`,
}