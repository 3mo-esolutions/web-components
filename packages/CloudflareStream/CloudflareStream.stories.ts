import { html } from '@a11d/lit'
import { Meta } from '@storybook/web-components'
import { story } from '../../.storybook/story'
import { CloudflareStreamAutoPause } from './CloudflareStream'
import '.'

export default {
	title: 'CloudflareStream',
	component: 'mo-cloudflare-stream',
	argTypes: {
		autoPause: {
			control: { type: 'select' },
			options: [
				CloudflareStreamAutoPause.WhenNotInViewport,
				CloudflareStreamAutoPause.WhenQuarterInViewport,
				CloudflareStreamAutoPause.WhenHalfInViewport,
			],
		},
	}
} as Meta

const defaultStreamSource = 'https://customer-m3y97nwa2fb7cpy9.cloudflarestream.com/39fc05d336585f825b0170efb2ff8783/iframe?preload=true&loop=true'

const loremIpsum = (repetition: number) => html`
	${new Array(repetition).fill(0).map(() => html`
		<p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Suscipit laudantium eos reprehenderit repudiandae officiis dolor explicabo aut necessitatibus ex voluptas soluta excepturi, est fugit exercitationem sunt recusandae voluptatibus aperiam nam?</p>
	`)}
`

export const Default = story({ source: defaultStreamSource }, props => html`
	<mo-cloudflare-stream source=${props.source}></mo-cloudflare-stream>
`)

export const AutoPause = story({ autoPause: CloudflareStreamAutoPause.WhenHalfInViewport, source: defaultStreamSource }, props => html`
	${loremIpsum(10)}
	<mo-cloudflare-stream autoPause=${props.autoPause} source=${props.source}></mo-cloudflare-stream>
	${loremIpsum(20)}
`)