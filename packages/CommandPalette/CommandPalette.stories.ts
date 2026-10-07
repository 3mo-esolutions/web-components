import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import { CommandPalette } from './index.js'
import dataSourcesSource from './stories/DataSources.ts?raw'
import './stories/DataSources.js'

export default {
	title: 'Actions / Command Palette',
	component: 'mo-command-palette',
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
	parameters: sourceOf(dataSourcesSource),
	render: () => html`<mo-command-palette-button></mo-command-palette-button>`,
}

/** The button takes its colors from the inherited `color`, so it fits an accent app bar as well as a plain one. */
export const OnColoredBars: Story = {
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 24px'>${story()}</div>`],
	render: () => html`
		<mo-flex direction='horizontal' alignItems='center' gap='16px' style='background: var(--mo-color-accent); color: var(--mo-color-on-accent); padding: 10px 16px; border-radius: var(--mo-border-radius)'>
			<mo-icon icon='menu'></mo-icon>
			<span style='font-weight: 500'>Nordwind</span>
			<div style='flex: 1'></div>
			<mo-command-palette-button></mo-command-palette-button>
		</mo-flex>
		<mo-flex direction='horizontal' alignItems='center' gap='16px' style='background: var(--mo-color-surface-container-high); padding: 10px 16px; border-radius: var(--mo-border-radius)'>
			<mo-icon icon='menu'></mo-icon>
			<span style='font-weight: 500'>Nordwind</span>
			<div style='flex: 1'></div>
			<mo-command-palette-button></mo-command-palette-button>
		</mo-flex>
	`,
}

/** `CommandPalette.open()` opens the palette from anywhere, such as a button of your own. */
export const OpenedProgrammatically: Story = {
	render: () => html`<mo-button type='filled' startIcon='search' @click=${() => CommandPalette.open()}>Search</mo-button>`,
}
