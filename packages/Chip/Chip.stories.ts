import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Chip',
	component: 'mo-chip',
	package: p,
} as Meta

export const Chip: StoryObj = {
	render: () => html`<mo-chip>Chip</mo-chip>`
}

export const WithLeadingIcon: StoryObj = {
	render: () => html`
		<mo-chip>
			<mo-icon-button dense slot='leading' icon='calendar_today'></mo-icon-button>
			With Leading Icon
		</mo-chip>
	`
}

export const WithTrailingIcon: StoryObj = {
	render: () => html`
		<mo-chip>
			With Trailing Icon
			<mo-icon-button dense slot='trailing' icon='delete'></mo-icon-button>
		</mo-chip>
	`
}

export const WithoutRipple: StoryObj = {
	render: () => html`
		<style>
			#without-ripple::part(ripple) { display: none; }
		</style>
		<mo-chip id='without-ripple'>Chip</mo-chip>
	`
}

export const Customized: StoryObj = {
	render: () => html`
		<style>
			#inactive {
				height: 36px;
				border: 1px solid var(--mo-color-gray-transparent);
				--mo-chip-foreground-color: var(--mo-color-gray);
				--mo-chip-background-color: transparent;
			}

			#active {
				height: 36px;
				border: 1px solid var(--mo-color-red);
				--mo-chip-foreground-color: var(--mo-color-red);
			}
		</style>
		<mo-chip id='inactive'>
			<mo-icon-button dense slot='leading' icon='calendar_today'></mo-icon-button>
			Inactive
		</mo-chip>
		<mo-chip id='active'>
			<mo-icon-button dense slot='leading' icon='calendar_today'></mo-icon-button>
			Active
		</mo-chip>
	`
}