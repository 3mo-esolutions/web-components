import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { CardType } from './Card.js'
import './index.js'

type Args = {
	readonly type: CardType
	readonly heading: string
	readonly subHeading: string
	readonly avatar: string
}

export default {
	title: 'Layout / Card',
	component: 'mo-card',
	args: {
		type: CardType.Filled,
		heading: 'Max Caulfield',
		subHeading: 'Photographer, Seattle',
		avatar: 'MC',
	},
	argTypes: {
		type: { control: 'select', options: Object.values(CardType) },
	},
	decorators: [story => html`<div style='display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 400px)); gap: 16px; align-items: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ type, heading, subHeading, avatar }) => html`
		<mo-card type=${type} heading=${heading} subHeading=${subHeading} avatar=${avatar}>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
		</mo-card>
	`,
}

/** `filled` lifts the card off the page with a shadow, `outlined` draws a border instead. */
export const Types: Story = {
	render: ({ subHeading, avatar }) => html`
		<mo-card type='filled' heading='Filled' subHeading=${subHeading} avatar=${avatar}>Documentary and portrait photographer.</mo-card>
		<mo-card type='outlined' heading='Outlined' subHeading=${subHeading} avatar=${avatar}>Documentary and portrait photographer.</mo-card>
	`,
}

/** The `action` slot places buttons in the header and the `footer` slot below the body. */
export const Actions: Story = {
	render: ({ type, heading, subHeading, avatar }) => html`
		<mo-card type=${type} heading=${heading} subHeading=${subHeading} avatar=${avatar}>
			<mo-icon-button slot='action' icon='share'></mo-icon-button>
			<mo-icon-button slot='action' icon='more_vert'></mo-icon-button>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
			<mo-button slot='footer'>Read more</mo-button>
		</mo-card>
	`,
}

/** `image` shows a picture above the header, and the `media` slot takes any other element there. */
export const Media: Story = {
	render: ({ type, heading, subHeading, avatar }) => html`
		<mo-card type=${type} heading=${heading} subHeading=${subHeading} avatar=${avatar} image='https://picsum.photos/seed/lighthouse/800/400'>
			<mo-icon-button slot='action' icon='share'></mo-icon-button>
			<mo-icon-button slot='action' icon='more_vert'></mo-icon-button>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
			The series follows the coast from Astoria to Cape Flattery, one lighthouse a week, each shot at dusk when the lamp first comes on.
			Prints of the first twelve are on show at the Two Whales Diner until the end of the month.
			<mo-button slot='footer'>Read more</mo-button>
		</mo-card>
		<mo-card type=${type} heading='Media slot'>
			<div slot='media' style='height: 160px; background: linear-gradient(135deg, var(--mo-color-accent), transparent)'></div>
			Any element can take the place of the image.
		</mo-card>
	`,
}

/** The `avatar`, `heading` and `subHeading` slots take any content in place of their attributes, and `header` replaces the whole header. */
export const Slots: Story = {
	render: ({ type }) => html`
		<mo-card type=${type}>
			<mo-icon slot='avatar' icon='photo_camera' style='font-size: 40px; color: var(--mo-color-accent)'></mo-icon>
			<mo-heading slot='heading' typography='heading3'>Lighthouses</mo-heading>
			<span slot='subHeading' style='color: var(--mo-color-gray)'>A photo series in twelve parts</span>
			Documentary and portrait photographer.
		</mo-card>
		<mo-card type=${type}>
			<mo-flex slot='header' direction='horizontal' alignItems='center' justifyContent='space-between' style='flex: 1'>
				<mo-heading typography='heading4'>Max Caulfield</mo-heading>
				<mo-button type='tonal' startIcon='person_add'>Follow</mo-button>
			</mo-flex>
			Documentary and portrait photographer.
		</mo-card>
	`,
}

/** The avatar colors and the padding of the header, body and footer are custom properties. */
export const CustomProperties: Story = {
	render: ({ type, heading, subHeading, avatar }) => html`
		<mo-card type=${type} heading=${heading} subHeading=${subHeading} avatar=${avatar} style='--mo-card-avatar-background: #3f51b5; --mo-card-avatar-color: white; --mo-card-header-padding: 24px; --mo-card-body-padding: 0 24px 24px; --mo-card-footer-padding: 0 16px 16px'>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
			<mo-button slot='footer'>Read more</mo-button>
		</mo-card>
	`,
}

/** The `header`, `avatar`, `heading`, `subHeading`, `media` and `footer` parts can be styled from outside. */
export const Parts: Story = {
	render: ({ type, heading, subHeading, avatar }) => html`
		<style>
			.banner::part(header) { background: var(--mo-color-accent); color: var(--mo-color-on-accent); border-radius: var(--mo-border-radius) var(--mo-border-radius) 0 0; margin-block-end: 16px; }
			.banner::part(avatar) { border-radius: var(--mo-border-radius); background: var(--mo-color-on-accent); color: var(--mo-color-accent); }
			.banner::part(subHeading) { color: inherit; opacity: 0.8; }
			.banner::part(footer) { border-block-start: 1px solid var(--mo-color-transparent-gray-3); }
		</style>
		<mo-card class='banner' type=${type} heading=${heading} subHeading=${subHeading} avatar=${avatar}>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
			<mo-button slot='footer'>Read more</mo-button>
		</mo-card>
	`,
}