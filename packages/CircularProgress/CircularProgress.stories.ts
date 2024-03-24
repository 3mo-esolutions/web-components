import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Circular Progress',
	component: 'mo-circular-progress',
	package: p,
} as Meta

export const Indeterminate: StoryObj = {
	render: () => html`<mo-circular-progress></mo-circular-progress>`
}

export const WithCustomColor: StoryObj = {
	render: () => html`<mo-circular-progress style='--mo-circular-progress-accent-color: var(--mo-color-red)'></mo-circular-progress>`
}

export const WithProgress: StoryObj = {
	args: { progress: 0.75 },
	argTypes: { progress: { control: 'number' } },
	render: ({ progress }) => html`<mo-circular-progress progress=${progress}></mo-circular-progress>`
}

export const WithCustomSize: StoryObj = {
	render: () => html`<mo-circular-progress ${style({ width: '100px', height: '100px' })}></mo-circular-progress>`
}