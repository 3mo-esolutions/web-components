import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Pdf',
	component: 'mo-pdf',
	package: p,
} as Meta

export const Pdf: StoryObj = {
	render: () => html`
		<mo-pdf style='height: 600px' source='https://pdfobject.com/pdf/sample.pdf'></mo-pdf>
	`
}