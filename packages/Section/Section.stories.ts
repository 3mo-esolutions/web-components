import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly heading: string
}

export default {
	title: 'Layout / Section',
	component: 'mo-section',
	args: {
		heading: 'About',
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ heading }) => html`
		<mo-section heading=${heading}>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
		</mo-section>
	`,
}

/** The `action` slot places buttons at the end of the header. */
export const Actions: Story = {
	render: ({ heading }) => html`
		<mo-section heading=${heading}>
			<mo-icon-button slot='action' icon='share'></mo-icon-button>
			<mo-icon-button slot='action' icon='more_vert'></mo-icon-button>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
		</mo-section>
	`,
}

/** The `heading` slot takes any content in place of the `heading` attribute, and `header` replaces the whole header. */
export const Slots: Story = {
	render: () => html`
		<mo-flex gap='24px'>
			<mo-section>
				<mo-flex slot='heading' direction='horizontal' alignItems='center' gap='8px'>
					<mo-icon icon='photo_camera'></mo-icon>
					<mo-heading typography='heading4'>Portfolio</mo-heading>
				</mo-flex>
				Twelve lighthouses along the Pacific coast.
			</mo-section>
			<mo-section>
				<mo-flex slot='header' direction='horizontal' alignItems='center' justifyContent='space-between'>
					<mo-heading typography='heading3'>Price list</mo-heading>
					<mo-button type='tonal' startIcon='download'>Download</mo-button>
				</mo-flex>
				Prints, licences and commissions, updated every season.
			</mo-section>
		</mo-flex>
	`,
}

/** The `header` and `heading` parts can be styled from outside, here with a line under the header. */
export const Parts: Story = {
	render: ({ heading }) => html`
		<style>
			.underlined::part(header) { border-block-end: 1px solid var(--mo-color-transparent-gray-3); padding-block-end: 4px; }
			.underlined::part(heading) { color: var(--mo-color-accent); }
		</style>
		<mo-section class='underlined' heading=${heading}>
			<mo-icon-button slot='action' icon='share'></mo-icon-button>
			<mo-icon-button slot='action' icon='more_vert'></mo-icon-button>
			Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
		</mo-section>
	`,
}