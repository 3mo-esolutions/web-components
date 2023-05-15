import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'File Upload Drop Area',
	component: 'mo-file-upload-drop-area',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const FileUploadDropArea = story({
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
		</style>
		<mo-file-upload-drop-area .upload=${(file: File) => alert(`Upload file ${file.name}`)}>
			<mo-flex alignItems='center' gap='10px'>
				<mo-icon icon='backup'></mo-icon>
				<span>Click OR Drag & Drop</span>
			</mo-flex>
		</mo-file-upload-drop-area>
	`
})