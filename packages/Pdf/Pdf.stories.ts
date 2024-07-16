import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Pdf',
	component: 'mo-pdf-old',
	package: p,
} as Meta

export const Pdf: StoryObj = {
	render: () => html`
		<mo-pdf-old style='height: 600px' source='https://www.africau.edu/images/default/sample.pdf'></mo-pdf-old>
	`
}