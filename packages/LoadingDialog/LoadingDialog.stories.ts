import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import noteDialogSource from './stories/NoteDialog.ts?raw'
import orderExportDialogSource from './stories/OrderExportDialog.ts?raw'
import { NoteDialog } from './stories/NoteDialog.js'
import { OrderExportDialog } from './stories/OrderExportDialog.js'
import './index.js'

export default {
	title: 'Feedback / Loading Dialog',
	component: 'mo-loading-dialog',
} satisfies Meta

/** Press Save: while `loading` is set, the content blurs behind a spinner and the heading reads "Loading ...". */
export const Default: StoryObj = {
	parameters: sourceOf(noteDialogSource),
	render: () => html`<mo-button @click=${() => new NoteDialog().confirm()}>Edit note</mo-button>`,
}

/** `loadingHeading` replaces the heading while loading and the `loading` slot the spinner; the content blurs behind it whatever the background. */
export const LoadingSlot: StoryObj = {
	parameters: sourceOf(orderExportDialogSource),
	render: () => html`<mo-button @click=${() => new OrderExportDialog().confirm()}>Export orders</mo-button>`,
}
