import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import './index.js'

type Args = {
	readonly href: string
	readonly target: string
	readonly onClick?: (event: Event) => void
}

export default {
	title: 'Actions / Anchor',
	component: 'mo-anchor',
	args: {
		href: 'https://www.3mo.de',
		target: '_blank',
	},
	argTypes: {
		target: { control: 'select', options: ['_self', '_blank', '_parent', '_top'] },
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; align-items: flex-start; gap: 8px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ href, target }) => html`<mo-anchor href=${href} target=${target}>3MO</mo-anchor>`,
}

/** The anchor takes the font of the text around it and only its color from the theme. */
export const InText: Story = {
	render: () => html`
		<span>
			Read the
			<mo-anchor href='https://www.3mo.de' target='_blank'>terms of service</mo-anchor>
			before placing the order.
		</span>
	`,
}

/** Without `href` it navigates nowhere and only fires `click` - for a middle click as well. */
export const WithoutHref: Story = {
	args: {
		onClick: fn(),
	},
	render: ({ onClick }) => html`<mo-anchor @click=${onClick}>Show details</mo-anchor>`,
}

/** `download`, `rel`, `ping` and `referrerPolicy` are passed on to the native link. */
export const LinkAttributes: Story = {
	render: () => html`
		<mo-anchor href='data:text/plain,Hello' download='hello.txt'>Download hello.txt</mo-anchor>
		<mo-anchor href='https://www.3mo.de' target='_blank' rel='noopener noreferrer' referrerPolicy='no-referrer'>3MO without a referrer</mo-anchor>
	`,
}

/** `--mo-anchor-color` replaces the accent color. */
export const CustomProperties: Story = {
	render: () => html`<mo-anchor href='https://www.3mo.de' target='_blank' style='--mo-anchor-color: var(--mo-color-red)'>3MO</mo-anchor>`,
}
