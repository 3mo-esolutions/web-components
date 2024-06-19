import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Cloudflare Stream',
	component: 'mo-cloudflare-stream',
	package: p,
} as Meta

const defaultStreamSource = 'https://customer-m3y97nwa2fb7cpy9.cloudflarestream.com/39fc05d336585f825b0170efb2ff8783/iframe?preload=true&loop=true'

export const Default: StoryObj = {
	args: { source: defaultStreamSource },
	render: ({ source }) => html`
		<mo-cloudflare-stream source=${source}></mo-cloudflare-stream>
	`
}

export const AutoPause: StoryObj = {
	args: {
		autoPause: '',
		source: defaultStreamSource
	},
	argTypes: {
		autoPause: {
			control: 'select',
			options: [
				'when-not-in-viewport',
				'when-quarter-in-viewport',
				'when-half-in-viewport',
			],
		},
	},
	render: ({ autoPause, source }) => html`
		${loremIpsum(20)}
		<mo-cloudflare-stream autoPause=${autoPause} source=${source}></mo-cloudflare-stream>
		${loremIpsum(40)}
	`,
}

const loremIpsum = (repetition: number) => html`
	${new Array(repetition).fill(0).map(() => html`
		<p>Lorem ipsum dolor sit.</p>
	`)}
`