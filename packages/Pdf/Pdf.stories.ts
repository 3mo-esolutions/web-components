import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Data / Pdf',
	component: 'mo-pdf',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-pdf style='height: 600px' source='https://pdfobject.com/pdf/sample.pdf'></mo-pdf>
	`,
}

/** The document has no size of its own and fills the one it is given, here the proportions of an A4 page. */
export const Size: StoryObj = {
	render: () => html`
		<mo-pdf style='width: 420px; aspect-ratio: 1 / 1.414' source='https://pdfobject.com/pdf/sample.pdf'></mo-pdf>
	`,
}