import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Slider',
	component: 'mo-slider',
	args: {
		disabled: false,
		discrete: false,
		ticks: false,
		value: 15,
		step: 1,
		min: 0,
		max: 100,
	},
	argTypes: {
		value: { control: 'number' },
		disabled: { control: 'boolean' },
		discrete: { control: 'boolean' },
		ticks: { control: 'boolean' },
		step: { control: 'number' },
		min: { control: 'number' },
		max: { control: 'number' },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Slider = story({
	render: ({ disabled, value, step, min, max, discrete, ticks }) => html`
		<mo-slider ${style({ marginTop: '20px' })}
			?discrete=${discrete}
			?ticks=${ticks}
			?disabled=${disabled}
			value=${value}
			step=${step}
			min=${min}
			max=${max}
		></mo-slider>
	`
})

export const WithCustomAccentColors = story({
	render: ({ disabled, value, step, min, max, discrete, ticks }) => html`
		<mo-slider ${style({ marginTop: '20px', '--mo-slider-accent-color': 'var(--mo-color-red)' })}
			?discrete=${discrete}
			?ticks=${ticks}
			?disabled=${disabled}
			value=${value}
			step=${step}
			min=${min}
			max=${max}
		></mo-slider>
	`
})