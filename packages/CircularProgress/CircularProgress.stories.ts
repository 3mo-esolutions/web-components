import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Core/Progress/CircularProgress',
	component: 'mo-circular-progress',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Indeterminate = story({
	render: () => html`<mo-circular-progress></mo-circular-progress>`
})

export const WithProgress = story({
	args: { progress: 0.75 },
	argTypes: { progress: { control: 'number' } },
	render: ({ progress }) => html`<mo-circular-progress progress=${progress}></mo-circular-progress>`
})

export const WithCustomSize = story({
	render: () => html`<mo-circular-progress ${style({ width: '100px', height: '100px' })}></mo-circular-progress>`
})