import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly valueStart: number
	readonly valueEnd: number
	readonly min: number
	readonly max: number
	readonly step: number
	readonly discrete: boolean
	readonly ticks: boolean
	readonly disabled: boolean
}

export default {
	title: 'Inputs / Range Slider',
	component: 'mo-range-slider',
	args: {
		valueStart: 40,
		valueEnd: 60,
		min: 0,
		max: 100,
		step: 1,
		discrete: false,
		ticks: false,
		disabled: false,
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 24px; max-width: 400px; padding-top: 24px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ valueStart, valueEnd, min, max, step, discrete, ticks, disabled }) => html`
		<mo-range-slider value=${JSON.stringify([valueStart, valueEnd])} min=${min} max=${max} step=${step} ?discrete=${discrete} ?ticks=${ticks} ?disabled=${disabled}></mo-range-slider>
	`,
}

/** `discrete` shows the values above the thumbs while they are dragged, and `ticks` marks every `step`. */
export const Discrete: Story = {
	render: () => html`<mo-range-slider value='[20, 80]' step='10' discrete ticks></mo-range-slider>`,
}

/** A disabled range slider turns gray and ignores input. */
export const Disabled: Story = {
	render: () => html`<mo-range-slider value='[20, 80]' disabled></mo-range-slider>`,
}

/** `--mo-slider-accent-color` colors the active track, the thumbs and the value labels. */
export const CustomProperties: Story = {
	render: () => html`<mo-range-slider value='[20, 80]' discrete style='--mo-slider-accent-color: var(--mo-color-red)'></mo-range-slider>`,
}

/** The `thumb` part styles both thumbs from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			.large-thumbs::part(thumb) { scale: 1.4; }
		</style>
		<mo-range-slider class='large-thumbs' value='[20, 80]'></mo-range-slider>
	`,
}