import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import childCountSource from './stories/ChildCount.ts?raw'
import characterCountSource from './stories/CharacterCount.ts?raw'
import './stories/ChildCount.js'
import './stories/CharacterCount.js'

export default {
	title: 'Behaviors / Mutation Observer',
} satisfies Meta

/** `observeMutation` on a `<slot>` also calls back on `slotchange`, so the list recounts as items are slotted in or out. Add and remove a few. */
export const Default: StoryObj = {
	parameters: sourceOf(childCountSource),
	decorators: [story => html`<mo-flex gap='16px'>${story()}</mo-flex>`],
	render: () => {
		const [items, setItems] = useState(['Apples', 'Pears'])
		return html`
			<mo-flex direction='horizontal' gap='8px'>
				<mo-button type='outlined' @click=${() => setItems([...items, `Item ${items.length + 1}`])}>Add</mo-button>
				<mo-button type='outlined' ?disabled=${!items.length} @click=${() => setItems(items.slice(0, -1))}>Remove</mo-button>
			</mo-flex>
			<story-child-count>
				${items.map(item => html`<div>${item}</div>`)}
			</story-child-count>
		`
	},
}

/** `MutationController` observes the host and re-renders it on every mutation. Type into the text and the count follows. */
export const Controller: StoryObj = {
	parameters: sourceOf(characterCountSource),
	render: () => html`
		<story-character-count>
			<div contenteditable style='padding: 0.5rem; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'>Edit this text.</div>
		</story-character-count>
	`,
}