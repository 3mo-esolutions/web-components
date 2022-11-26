import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Input/Slider/RangeSlider',
	component: 'mo-range-slider',
	args: {
		disabled: false,
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

export const RangeSlider = story({
	render: ({ disabled, valueStart, valueEnd, step, min, max }) => html`
		<mo-range-slider ${style({ marginTop: '20px' })}
			?disabled=${disabled}
			.value=${[valueStart, valueEnd]}
			step=${step}
			min=${min}
			max=${max}
		></mo-range-slider>
	`
})