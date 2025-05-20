import type { Meta, StoryObj } from '@storybook/web-components'
import { html, ifDefined } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Buttons & Actions / Anchor',
	component: 'mo-anchor',
	package: p,
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
} as Meta

export const Anchor: StoryObj = {
	render: ({ href, target, download, ping, referrerPolicy, rel }) => {
		return html`
			<mo-anchor href=${ifDefined(href)} target=${ifDefined(target)} download=${ifDefined(download)} ping=${ifDefined(ping)} referrerPolicy=${ifDefined(referrerPolicy)} rel=${ifDefined(rel)}>Anchor</mo-anchor>
		`
	}
}

export const WithoutHref: StoryObj = {
	render: () => {
		return html`
			<mo-anchor @click=${() => alert('Anchor was clicked!')}>Anchor</mo-anchor>
		`
	}
}