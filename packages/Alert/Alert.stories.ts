import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Alert',
	component: 'mo-alert',
	package: p,
} as Meta

export const Default: StoryObj = {
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