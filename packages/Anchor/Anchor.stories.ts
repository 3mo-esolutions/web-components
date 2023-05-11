import { story, meta } from '../../.storybook/story.js'
import { html, ifDefined } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Anchor',
	component: 'mo-anchor',
	args: {
		href: 'https://www.3mo.de',
		target: '_blank',
		download: undefined,
		ping: undefined,
		referrerPolicy: undefined,
		rel: undefined,
	},
	argTypes: {
		href: { control: 'text' },
		target: { control: 'text' },
		download: { control: 'text' },
		ping: { control: 'text' },
		referrerPolicy: { control: 'text' },
		rel: { control: 'text' },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Anchor = story({
	render: ({ href, target, download, ping, referrerPolicy, rel }) => {
		return html`
			<mo-anchor href=${ifDefined(href)} target=${ifDefined(target)} download=${ifDefined(download)} ping=${ifDefined(ping)} referrerPolicy=${ifDefined(referrerPolicy)} rel=${ifDefined(rel)}>Anchor</mo-anchor>
		`
	}
})

export const WithoutHref = story({
	render: () => {
		return html`
			<mo-anchor @click=${() => alert('Anchor was clicked!')}>Anchor</mo-anchor>
		`
	}
})