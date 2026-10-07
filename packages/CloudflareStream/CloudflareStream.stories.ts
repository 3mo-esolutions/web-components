import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { CloudflareStreamAutoPause } from './CloudflareStream.js'
import './index.js'

type Args = {
	readonly autoPause?: CloudflareStreamAutoPause
}

export default {
	title: 'Data / Cloudflare Stream',
	component: 'mo-cloudflare-stream',
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: () => html`
		<mo-cloudflare-stream source='https://customer-m3y97nwa2fb7cpy9.cloudflarestream.com/39fc05d336585f825b0170efb2ff8783/iframe?preload=true&amp;loop=true'></mo-cloudflare-stream>
	`,
}

/** The player keeps a 16:9 ratio and fills the width it is given. */
export const Size: Story = {
	render: () => html`
		<mo-cloudflare-stream style='width: 320px' source='https://customer-m3y97nwa2fb7cpy9.cloudflarestream.com/39fc05d336585f825b0170efb2ff8783/iframe?preload=true&amp;loop=true'></mo-cloudflare-stream>
	`,
}

/** `autoPause` pauses the video once it leaves the viewport, or once only a quarter or half of it is left in view, and plays it again when it returns - scroll past it. */
export const AutoPause: Story = {
	args: {
		autoPause: 'when-half-in-viewport',
	},
	argTypes: {
		autoPause: { control: 'select', options: ['when-not-in-viewport', 'when-quarter-in-viewport', 'when-half-in-viewport'] },
	},
	decorators: [story => html`
		<div style='height: 80vh'></div>
		${story()}
		<div style='height: 80vh'></div>
	`],
	render: ({ autoPause }) => html`
		<mo-cloudflare-stream autoPause=${autoPause ?? ''} source='https://customer-m3y97nwa2fb7cpy9.cloudflarestream.com/39fc05d336585f825b0170efb2ff8783/iframe?preload=true&amp;loop=true'></mo-cloudflare-stream>
	`,
}
