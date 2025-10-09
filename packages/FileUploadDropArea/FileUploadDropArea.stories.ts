import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Selection & Input / File Upload Drop Area',
	component: 'mo-file-upload-drop-area',
	package: p,
} as Meta

export const FileUploadDropArea: StoryObj = {
	render: () => html`
		<style>
			mo-icon {
				font-size: 50px;
				color: var(--mo-color-gray);
			}

			mo-flex * {
				transition: 250ms;
			}

			mo-file-upload-drop-area[drag] * {
				color: var(--mo-color-accent) !important;
			}

			span {
				user-select: none;
			}
		</style>
		<mo-file-upload-drop-area .upload=${(file: File) => alert(`Upload file ${file.name}`)}>
			<mo-flex alignItems='center' gap='0.5rem'>
				<mo-icon icon='backup'></mo-icon>
				<span>Click OR Drag & Drop</span>
			</mo-flex>
		</mo-file-upload-drop-area>
	`
}