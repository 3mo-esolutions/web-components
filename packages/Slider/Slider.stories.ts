import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly value: number
	readonly min: number
	readonly max: number
	readonly step: number
	readonly discrete: boolean
	readonly ticks: boolean
	readonly disabled: boolean
}

export default {
	title: 'Inputs / Slider',
	component: 'mo-slider',
	args: {
		value: 15,
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
	render: ({ value, min, max, step, discrete, ticks, disabled }) => html`
		<mo-slider value=${value} min=${min} max=${max} step=${step} ?discrete=${discrete} ?ticks=${ticks} ?disabled=${disabled}></mo-slider>
	`,
}

/** `discrete` shows the value above the thumb while it is dragged, and `ticks` marks every `step`. */
export const Discrete: Story = {
	render: () => html`<mo-slider value='40' step='10' discrete ticks></mo-slider>`,
}

/** A disabled slider turns gray and ignores input. */
export const Disabled: Story = {
	render: () => html`<mo-slider value='40' disabled></mo-slider>`,
}

/** `--mo-slider-accent-color` colors the active track, the thumb and the value label. */
export const CustomProperties: Story = {
	render: () => html`<mo-slider value='40' discrete style='--mo-slider-accent-color: var(--mo-color-red)'></mo-slider>`,
}

/** The `thumb` part can be restyled from outside. */
export const Parts: Story = {
	render: () => html`
		<style>
			.large-thumb::part(thumb) { scale: 1.4; }
		</style>
		<mo-slider class='large-thumb' value='40'></mo-slider>
	`,
}
