import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Communication / Alert',
	component: 'mo-alert',
	package: p,
} as Meta

export const Alert: StoryObj = {
	render: () => html`
		<mo-flex gap='8px'>
			<mo-alert type='info' heading='Info'></mo-alert>
			<mo-alert type='success' heading='Success'></mo-alert>
			<mo-alert type='warning' heading='Warning'></mo-alert>
			<mo-alert type='error' heading='Error'></mo-alert>
		</mo-flex>
	`
}

export const WithBody: StoryObj = {
	render: () => html`
		<mo-flex gap='8px'>
			<mo-alert type='info' heading='Info'>Text</mo-alert>
			<mo-alert type='success' heading='Success'>Text</mo-alert>
			<mo-alert type='warning' heading='Warning'>Text</mo-alert>
			<mo-alert type='error' heading='Error'>Text</mo-alert>
		</mo-flex>
	`
}

export const WithBodyAndCollapsible: StoryObj = {
	render: () => html`
		<mo-flex gap='8px'>
			<mo-alert type='info' heading='Info' collapsible>Text</mo-alert>
			<mo-alert type='success' heading='Success' collapsible>Text</mo-alert>
			<mo-alert type='warning' heading='Warning' collapsible>Text</mo-alert>
			<mo-alert type='error' heading='Error' collapsible>Text</mo-alert>
		</mo-flex>
	`
}

export const WithCustomColorAndHeading: StoryObj = {
	render: () => html`
		<mo-flex gap='8px'>
			<mo-alert type='warning' heading='Important' style='--mo-alert-color: #8957e5'>
				Have something very important?
			</mo-alert>

			<mo-alert type='info' heading='Not Important' style='--mo-alert-color: var(--mo-color-gray)' collapsible>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corporis quos labore qui placeat vel illum est dignissimos provident consectetur amet natus iure quo earum at, quidem veritatis optio quaerat excepturi!
			</mo-alert>
		</mo-flex>
	`
}

export const WithForcedHeight: StoryObj = {
	render: () => html`
		<mo-grid gap='0.5rem' columns='repeat(auto-fit, minmax(300px, 1fr))'>
			<mo-alert type='info' heading='Alert 1' style='height: 100%'>
				Some information
			</mo-alert>

			<mo-alert type='info' heading='Alert 2'>
				Some longer information that makes this alert taller than the first one.
				But the first alert should still take the full height of this container.
			</mo-alert>
		</mo-grid>
	`
}