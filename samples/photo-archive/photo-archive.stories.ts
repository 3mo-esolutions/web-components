import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import photoArchiveSource from './PhotoArchive.ts?raw'
import photoDialogSource from './PhotoDialog.ts?raw'
import './PhotoArchive.js'

/**
 * A photo archive: a moddable data grid of photos with an album filter in its toolbar, a preview in the row details,
 * a context menu to open or delete them and a fetchable dialog with a photo's details.
 */
export default {
	title: 'Recipes / Photo Archive',
} satisfies Meta

export const Default: StoryObj = {
	parameters: sourceOf(`${photoArchiveSource}\n\n${photoDialogSource}`),
	render: () => html`<recipe-photo-archive style='height: 640px'></recipe-photo-archive>`,
}