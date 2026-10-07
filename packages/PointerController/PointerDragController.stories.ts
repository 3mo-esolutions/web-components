import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import draggableCardSource from './stories/DraggableCard.ts?raw'
import resizablePanelSource from './stories/ResizablePanel.ts?raw'
import messageRowsSource from './stories/MessageRows.ts?raw'
import './stories/DraggableCard.js'
import './stories/ResizablePanel.js'
import './stories/MessageRows.js'

export default {
	title: 'Behaviors / Pointer Drag Controller',
} satisfies Meta

/** A press becomes a drag once it has travelled 4px, so a click still counts - and dropping the card never clicks it. */
export const Default: StoryObj = {
	parameters: sourceOf(draggableCardSource),
	render: () => html`<story-draggable-card></story-draggable-card>`,
}

/** With `threshold: 0` the press itself is the drag, captured at once, so the handle keeps following outside the frame. A drag the browser takes over puts the panel back. */
export const ResizeHandle: StoryObj = {
	parameters: sourceOf(resizablePanelSource),
	render: () => html`<story-resizable-panel></story-resizable-panel>`,
}

/** `isDrag` is asked on a press's first movement: sideways slides a row open to its action, up or down leaves the list to scroll. */
export const AlongOneAxis: StoryObj = {
	parameters: sourceOf(messageRowsSource),
	render: () => html`<story-message-rows></story-message-rows>`,
}
