import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { type FileUpload as FileUploadC } from './FileUpload.js'
import p from './package.json'
import '.'

export default {
	title: 'Selection & Input / File Upload',
	component: 'mo-file-upload',
	package: p,
} as Meta

const openExplorer = (e: Event) => {
	(e.currentTarget as HTMLElement).parentElement
		?.querySelector<FileUploadC<void>>('mo-file-upload')
		?.openExplorer()
}

export const FileUpload: StoryObj = {
	render: () => html`
		<mo-file-upload uploadOnSelection
			.upload=${(file: File) => alert(`Upload file ${file.name}`)}
		></mo-file-upload>
		<mo-button type='outlined' @click=${openExplorer}>Select a file</mo-button>
	`
}

export const Multiple: StoryObj = {
	render: () => html`
		<mo-file-upload multiple uploadOnSelection
			.upload=${(files: Array<File>) => alert(`Upload files ${files.map(file => file.name).join(', ')}`)}
		></mo-file-upload>
		<mo-button type='outlined' @click=${openExplorer}>Select multiple files</mo-button>
	`
}