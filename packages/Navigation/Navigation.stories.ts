import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { NavigationPresentation } from './NavigationPresentation.js'
import { navigations } from './stories/navigations.js'
import './index.js'

type Args = {
	readonly presentations: Array<NavigationPresentation>
}

export default {
	title: 'Layout / Navigation',
	component: 'mo-navigation',
	args: {
		presentations: ['bar', 'drawer'],
	},
	argTypes: {
		presentations: { control: 'object' },
	},
	decorators: [story => html`<div style='display: flex; flex-direction: column; height: 600px; border: 1px solid var(--mo-color-transparent-gray-3)'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

/** The bar shows while its navigations fit its row, and the drawer once they do not - narrow the canvas to watch it change over. */
export const Default: Story = {
	render: ({ presentations }) => html`
		<mo-navigation heading='Business Suite' .navigations=${navigations} .presentations=${presentations}>
			<mo-heading typography='heading3' style='padding: 2rem'>Dashboard</mo-heading>
		</mo-navigation>
	`,
}

/**
 * With `rail` in the order, the rail takes over once the bar no longer fits, as long as the page keeps its room beside it.
 * Picking a group shows its destinations in a panel, docked beside the page while both fit.
 */
export const Rail: Story = {
	args: { presentations: ['bar', 'rail', 'drawer'] },
	render: ({ presentations }) => html`
		<mo-navigation heading='Business Suite' .navigations=${navigations} .presentations=${presentations}>
			<mo-heading typography='heading3' style='padding: 2rem'>Dashboard</mo-heading>
		</mo-navigation>
	`,
}

/** The drawer holds every navigation as one tree, over the page; the menu button in the header opens it. */
export const Drawer: Story = {
	args: { presentations: ['drawer'] },
	render: ({ presentations }) => html`
		<mo-navigation heading='Business Suite' .navigations=${navigations} .presentations=${presentations}>
			<mo-heading typography='heading3' style='padding: 2rem'>Dashboard</mo-heading>
		</mo-navigation>
	`,
}

/** The `logo` slot leads the header, or tops the rail, and the `end` slot closes the header. */
export const Slots: Story = {
	render: ({ presentations }) => html`
		<mo-navigation heading='Business Suite' .navigations=${navigations} .presentations=${presentations}>
			<mo-icon slot='logo' icon='hub' style='font-size: 28px'></mo-icon>
			<mo-icon-button slot='end' icon='notifications'></mo-icon-button>
			<mo-icon-button slot='end' icon='account_circle'></mo-icon-button>
			<mo-heading typography='heading3' style='padding: 2rem'>Dashboard</mo-heading>
		</mo-navigation>
	`,
}

/** The rail's sizes and the room the page keeps beside it are custom properties, which move the point where the rail gives way to the drawer. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-navigation heading='Business Suite' .navigations=${navigations} .presentations=${['rail', 'drawer']}
			style='--mo-navigation-rail-size: 4.5rem; --mo-navigation-rail-panel-size: 14rem; --mo-navigation-min-content-size: 20rem'
		>
			<mo-heading typography='heading3' style='padding: 2rem'>Dashboard</mo-heading>
		</mo-navigation>
	`,
}

/** The `app-bar` and `content` parts can be styled from outside. */
export const Parts: Story = {
	render: ({ presentations }) => html`
		<style>
			#styled-navigation::part(app-bar) {
				background: var(--mo-color-surface-container-high);
				color: var(--mo-color-foreground);
			}

			#styled-navigation::part(content) {
				background: var(--mo-color-transparent-gray-1);
			}
		</style>
		<mo-navigation id='styled-navigation' heading='Business Suite' .navigations=${navigations} .presentations=${presentations}>
			<mo-heading typography='heading3' style='padding: 2rem'>Dashboard</mo-heading>
		</mo-navigation>
	`,
}
