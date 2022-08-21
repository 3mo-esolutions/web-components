import { story, meta } from '../../.storybook/story'
import { html } from '@a11d/lit'
import { CloudflareStreamAutoPause } from './CloudflareStream'
import '.'

export default meta({
	title: 'CloudflareStream',
	component: 'mo-cloudflare-stream',
})

const defaultStreamSource = 'https://customer-m3y97nwa2fb7cpy9.cloudflarestream.com/39fc05d336585f825b0170efb2ff8783/iframe?preload=true&loop=true'

export const Default = story({
	args: { source: defaultStreamSource },
	render: ({ source }) => html`
		<mo-cloudflare-stream source=${source}></mo-cloudflare-stream>
	`
})

export const AutoPause = story({
	args: {
		autoPause: CloudflareStreamAutoPause.WhenHalfInViewport,
		source: defaultStreamSource
	},
	argTypes: {
		autoPause: {
			control: { type: 'select' },
			options: [
				CloudflareStreamAutoPause.WhenNotInViewport,
				CloudflareStreamAutoPause.WhenQuarterInViewport,
				CloudflareStreamAutoPause.WhenHalfInViewport,
			],
		},
	},
	render: ({ autoPause, source }) => html`
		${loremIpsum(20)}
		<mo-cloudflare-stream autoPause=${autoPause} source=${source}></mo-cloudflare-stream>
		${loremIpsum(40)}
	`,
})

const loremIpsum = (repetition: number) => html`
	${new Array(repetition).fill(0).map(() => html`
		<p>Lorem ipsum dolor sit.</p>
	`)}
`