import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly progress: number
}

export default {
	title: 'Feedback / Circular Progress',
	component: 'mo-circular-progress',
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 16px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: () => html`<mo-circular-progress></mo-circular-progress>`,
}

/** `progress` from `0` to `1` fills the circle; without it, the indicator spins for work of unknown length. */
export const Progress: Story = {
	args: {
		progress: 0.75,
	},
	argTypes: {
		progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
	},
	render: ({ progress }) => html`<mo-circular-progress progress=${progress}></mo-circular-progress>`,
}

/** The indicator is 48px square by default and scales with `width` and `height`. */
export const Size: Story = {
	render: () => html`
		<mo-circular-progress style='width: 24px; height: 24px'></mo-circular-progress>
		<mo-circular-progress></mo-circular-progress>
		<mo-circular-progress style='width: 100px; height: 100px'></mo-circular-progress>
	`,
}

/** `--mo-circular-progress-accent-color` colors the indicator and `--mo-circular-progress-track-color` the track behind it. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-circular-progress style='--mo-circular-progress-accent-color: var(--mo-color-red)'></mo-circular-progress>
		<mo-circular-progress progress='0.6' style='--mo-circular-progress-accent-color: var(--mo-color-green); --mo-circular-progress-track-color: var(--mo-color-transparent-gray-3)'></mo-circular-progress>
	`,
}