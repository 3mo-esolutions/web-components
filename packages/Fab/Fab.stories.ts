import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Floating Action Button (FAB)',
	component: 'mo-fab',
	package: p,
} as Meta

export const Default: StoryObj = {
	render: () => html`<mo-fab icon='add'></mo-fab>`
}

export const Dense: StoryObj = {
	render: () => html`<mo-fab icon='add' dense></mo-fab>`
}

export const IconAtEnd: StoryObj = {
	render: () => html`<mo-fab icon='add' iconAtEnd>Test</mo-fab>`
}

export const WithLabel: StoryObj = {
	args: { label: 'Add' },
	argTypes: { label: { control: 'text' } },
	render: ({ label }) => html`<mo-fab icon='add'>${label}</mo-fab>`
}