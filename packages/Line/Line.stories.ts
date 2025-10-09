import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Data Display / Line',
	component: 'mo-line',
	package: p,
} as Meta

export const Line: StoryObj = {
	render: () => html`<mo-line></mo-line>`
}

export const WithLabel: StoryObj = {
	render: () => html`<mo-line>Separator</mo-line>`
}

export const WithStyledLabel: StoryObj = {
	render: () => html`<mo-line style='color: var(--mo-color-red)'>Styled Separator</mo-line>`
}

export const WithVerticalDirection: StoryObj = {
	render: () => html`
		<mo-flex direction='horizontal' style='height: 100px'>
			<div style='flex: 1'>Item 1</div>
			<mo-line direction='vertical'></mo-line>
			<div style='flex: 1'>Item 2</div>
		</mo-flex>
	`
}

export const WithVerticalDirectionAndCustomLabel: StoryObj = {
	render: () => html`
		<mo-flex direction='horizontal' style='height: 100px'>
			<div style='flex: 1'>Item 1</div>
			<mo-line direction='vertical'>Separator</mo-line>
			<div style='flex: 1'>Item 2</div>
		</mo-flex>
	`
}