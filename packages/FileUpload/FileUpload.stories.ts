import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import { fileDrop } from './fileDrop.js'
import './index.js'

type Args = {
	readonly upload: (selection: File | Array<File> | undefined) => Promise<void>
	readonly handleDrop: (files: Array<File>) => void
}

export default {
	title: 'Inputs / File Upload',
	component: 'mo-file-upload',
	args: {
		upload: fn(),
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ upload }) => html`
		<mo-file-upload uploadOnSelection .upload=${upload}></mo-file-upload>
		<mo-button type='outlined' startIcon='upload' @click=${(event: Event) => (event.currentTarget as Element).parentElement!.querySelector('mo-file-upload')!.openExplorer()}>Choose a file</mo-button>
	`,
}

/** `multiple` passes an array of files to `upload`. */
export const Multiple: Story = {
	render: ({ upload }) => html`
		<mo-file-upload multiple uploadOnSelection .upload=${upload}></mo-file-upload>
		<mo-button type='outlined' startIcon='upload' @click=${(event: Event) => (event.currentTarget as Element).parentElement!.querySelector('mo-file-upload')!.openExplorer()}>Choose files</mo-button>
	`,
}

/** `accept` limits the choice to MIME types or file extensions, as on a native file input. */
export const Accept: Story = {
	render: ({ upload }) => html`
		<mo-file-upload accept='image/*,.pdf' uploadOnSelection .upload=${upload}></mo-file-upload>
		<mo-button type='outlined' startIcon='image' @click=${(event: Event) => (event.currentTarget as Element).parentElement!.querySelector('mo-file-upload')!.openExplorer()}>Choose an image or PDF</mo-button>
	`,
}

/** Without `uploadOnSelection`, choosing a file only dispatches `selectionChange`, and `uploadSelection()` uploads it later. */
export const UploadLater: Story = {
	render: ({ upload }) => html`
		<mo-file-upload .upload=${upload}></mo-file-upload>
		<mo-button type='outlined' @click=${(event: Event) => (event.currentTarget as Element).parentElement!.querySelector('mo-file-upload')!.openExplorer()}>Choose a file</mo-button>
		<mo-button type='filled' @click=${(event: Event) => (event.currentTarget as Element).parentElement!.querySelector('mo-file-upload')!.uploadSelection()}>Upload</mo-button>
	`,
}

/** `fileDrop` makes any element accept dropped files and stamps `dragover` on it while they are dragged over - drop a file on the field. */
export const Drop: Story = {
	args: {
		handleDrop: fn(),
	},
	render: ({ handleDrop }) => html`
		<style>
			mo-field-text-area[dragover] {
				outline: 2px dashed var(--mo-color-accent);
				outline-offset: 4px;
			}
		</style>
		<mo-field-text-area label='Message' style='flex: 1' ${fileDrop({ multiple: true, handleDrop })}></mo-field-text-area>
	`,
}