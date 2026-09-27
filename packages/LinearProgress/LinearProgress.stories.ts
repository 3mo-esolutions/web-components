import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly progress: number
	readonly buffer: number
}

export default {
	title: 'Feedback / Linear Progress',
	component: 'mo-linear-progress',
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 24px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: () => html`<mo-linear-progress></mo-linear-progress>`,
}

/** `progress` from `0` to `1` fills the bar; with neither `progress` nor `buffer`, it runs for work of unknown length. */
export const Progress: Story = {
	args: {
		progress: 0.75,
	},
	argTypes: {
		progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
	},
	render: ({ progress }) => html`<mo-linear-progress progress=${progress}></mo-linear-progress>`,
}

/** `buffer` marks what is loaded ahead of the progress, like the buffered part of a video. */
export const Buffer: Story = {
	args: {
		progress: 0.5,
		buffer: 0.75,
	},
	argTypes: {
		progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
		buffer: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
	},
	render: ({ progress, buffer }) => html`
		<mo-linear-progress buffer=${buffer}></mo-linear-progress>
		<mo-linear-progress progress=${progress} buffer=${buffer}></mo-linear-progress>
	`,
}

/** The bar is 4px high by default; `height` and `border-radius` restyle it, e.g. into a pill that carries its label. */
export const Styling: Story = {
	render: () => html`
		<mo-linear-progress style='height: 20px; border-radius: 100px'></mo-linear-progress>
		<div style='position: relative'>
			<mo-linear-progress progress='0.5' style='height: 20px; border-radius: 100px'></mo-linear-progress>
			<span style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); mix-blend-mode: difference; color: white'>50%</span>
		</div>
	`,
}

/** `--mo-linear-progress-accent-color` colors the bar and `--mo-linear-progress-track-color` the track behind it. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-linear-progress style='--mo-linear-progress-accent-color: var(--mo-color-red)'></mo-linear-progress>
		<mo-linear-progress progress='0.6' style='--mo-linear-progress-accent-color: var(--mo-color-green); --mo-linear-progress-track-color: var(--mo-color-transparent-gray-3)'></mo-linear-progress>
	`,
}