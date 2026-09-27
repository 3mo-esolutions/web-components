import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import { FontImporter } from './index.js'

export default {
	title: 'Utilities / Font Importer',
} satisfies Meta

/** Importing a stylesheet URL makes its font available to the whole document. Importing the same URL again does nothing. */
export const Default: StoryObj = {
	parameters: sourceOf(`
FontImporter.import('https://fonts.googleapis.com/css2?family=Pacifico&display=swap')

html\`<span style='font-family: Pacifico; font-size: 2rem'>Hello, world</span>\`
	`),
	render: () => {
		FontImporter.import('https://fonts.googleapis.com/css2?family=Pacifico&display=swap')
		return html`<span style='font-family: Pacifico; font-size: 2rem'>Hello, world</span>`
	},
}