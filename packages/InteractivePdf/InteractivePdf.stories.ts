import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import { DocumentController } from './DocumentController.js'
import './index.js'

export default {
	title: 'Interactive Pdf',
	component: 'mo-interactive-pdf',
	package: p,
} as Meta

export const InteractivePdf: StoryObj = {
	render: () => {
		requestIdleCallback(() => {
			DocumentController.workerUrl = './pdf.worker.mjs'
		})
		return html`
			<script type="module" src="./pdf.mjs"></script>

			<style>
				mo-interactive-pdf::part(viewer) {
					min-height: 600px;
				}
			</style>

			<mo-interactive-pdf name='Fiber' source='https://pdfobject.com/pdf/sample.pdf'></mo-interactive-pdf>
		`
	}
}