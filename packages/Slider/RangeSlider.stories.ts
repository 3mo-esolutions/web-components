import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Range Slider',
	component: 'mo-range-slider',
	args: {
		disabled: false,
		discrete: false,
		ticks: false,
		valueStart: 40,
		valueEnd: 60,
		step: 1,
		min: 0,
		max: 100,
	},
	argTypes: {
		valueStart: { control: 'number' },
		valueEnd: { control: 'number' },
		disabled: { control: 'boolean' },
		discrete: { control: 'boolean' },
		ticks: { control: 'boolean' },
		step: { control: 'number' },
		min: { control: 'number' },
		max: { control: 'number' },
	},
	package: p,
} as Meta

export const RangeSlider: StoryObj = {
	render: ({ disabled, discrete, ticks, valueStart, valueEnd, step, min, max }) => html`
		<mo-range-slider ${style({ marginTop: '20px' })}
			?discrete=${discrete}
			?ticks=${ticks}
			?disabled=${disabled}
			.value=${[valueStart, valueEnd]}
			step=${step}
			min=${min}
			max=${max}
		></mo-range-slider>
	`
}

export const WithCustomAccentColors: StoryObj = {
	render: ({ disabled, discrete, ticks, valueStart, valueEnd, step, min, max }) => html`
		<mo-range-slider ${style({ marginTop: '20px', '--mo-slider-accent-color': 'var(--mo-color-red)' })}
			?discrete=${discrete}
			?ticks=${ticks}
			?disabled=${disabled}
			.value=${[valueStart, valueEnd]}
			step=${step}
			min=${min}
			max=${max}
		></mo-range-slider>
	`
}