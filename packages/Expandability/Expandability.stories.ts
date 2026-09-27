import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import departmentTreeSource from './stories/DepartmentTree.ts?raw'
import './stories/DepartmentTree.js'

export default {
	title: 'Behaviors / Expandability',
} satisfies Meta

/**
 * Open a few branches, then press Refetch: equal departments arrive as new objects and the same rows stay open, as the set is keyed by id.
 * A lone disclosure needs none of this: use `mo-expander` or `mo-accordion-item`.
 */
export const Default: StoryObj = {
	parameters: sourceOf(departmentTreeSource),
	render: () => html`<story-department-tree></story-department-tree>`,
}

/** `multiple: false` keeps one branch open at a time; `ancestorsOf` keeps the open branch's ancestors open with it. */
export const SingleBranch: StoryObj = {
	render: () => html`<story-department-tree single></story-department-tree>`,
}

/** `load` is awaited before a branch first opens; the row is stamped `loading` meanwhile. */
export const LazyChildren: StoryObj = {
	render: () => html`<story-department-tree lazy></story-department-tree>`,
}