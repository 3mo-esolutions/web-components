import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import './index.js'

type Args = {
	readonly upload: (selection: File | Array<File> | undefined) => Promise<void>
}

export default {
	title: 'Inputs / File Upload Drop Area',
	component: 'mo-file-upload-drop-area',
	args: {
		upload: fn(),
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ upload }) => html`
		<mo-file-upload-drop-area .upload=${upload}>
			<mo-flex alignItems='center' gap='0.5rem'>
				<mo-icon icon='backup' style='font-size: 50px; color: var(--mo-color-gray)'></mo-icon>
				<span>Drop a file here or click to choose one</span>
			</mo-flex>
		</mo-file-upload-drop-area>
	`,
}

/** `multiple` accepts several files at once and passes them to `upload` as an array. */
export const Multiple: Story = {
	render: ({ upload }) => html`
		<mo-file-upload-drop-area multiple .upload=${upload}>
			<mo-flex alignItems='center' gap='0.5rem'>
				<mo-icon icon='backup' style='font-size: 50px; color: var(--mo-color-gray)'></mo-icon>
				<span>Drop files here or click to choose them</span>
			</mo-flex>
		</mo-file-upload-drop-area>
	`,
}

/** `accept` filters both the file dialog and the dropped files - drop anything but an image and nothing is uploaded. */
export const Accept: Story = {
	render: ({ upload }) => html`
		<mo-file-upload-drop-area accept='image/*' .upload=${upload}>
			<mo-flex alignItems='center' gap='0.5rem'>
				<mo-icon icon='image' style='font-size: 50px; color: var(--mo-color-gray)'></mo-icon>
				<span>Drop an image here or click to choose one</span>
			</mo-flex>
		</mo-file-upload-drop-area>
	`,
}

/** The area carries a `dragover` attribute while files are dragged over it, which the content can be styled by. */
export const Dragover: Story = {
	render: ({ upload }) => html`
		<style>
			.upload-area mo-icon {
				font-size: 50px;
				color: var(--mo-color-gray);
				transition: 250ms;
			}

			.upload-area[dragover] mo-icon {
				color: var(--mo-color-accent);
				scale: 1.2;
			}
		</style>
		<mo-file-upload-drop-area class='upload-area' .upload=${upload}>
			<mo-flex alignItems='center' gap='0.5rem'>
				<mo-icon icon='backup'></mo-icon>
				<span>Drag a file over this area</span>
			</mo-flex>
		</mo-file-upload-drop-area>
	`,
}