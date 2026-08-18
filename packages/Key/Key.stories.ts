import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Data Display / Key',
	component: 'mo-key',
	package: p,
} as Meta

export const Key: StoryObj = {
	render: () => html`<mo-key>Meta+K</mo-key>`
}

export const PlatformComparison: StoryObj = {
	render: () => html`
		<mo-grid columns='auto auto' gap='10px 30px' style='justify-content: start; align-items: center'>
			<span>Apple platforms</span>
			<mo-key platform='apple'>Meta+Shift+P</mo-key>

			<span>Other platforms</span>
			<mo-key platform='other'>Meta+Shift+P</mo-key>
		</mo-grid>
	`
}

export const SpecialKeys: StoryObj = {
	render: () => html`
		<mo-flex gap='10px' alignItems='start'>
			<mo-key>Escape</mo-key>
			<mo-key>Enter</mo-key>
			<mo-key>Tab</mo-key>
			<mo-key>Backspace</mo-key>
			<mo-key>ArrowUp ArrowDown ArrowLeft ArrowRight</mo-key>
			<mo-key>PageUp PageDown</mo-key>
			<mo-key>F5</mo-key>
		</mo-flex>
	`
}

export const IndependentKeys: StoryObj = {
	render: () => html`
		<span style='display: flex; align-items: center; gap: 6px'>
			<mo-key>ArrowUp ArrowDown</mo-key>
			to navigate the list
		</span>
	`
}

export const CustomSeparator: StoryObj = {
	render: () => html`<mo-key separator='then'>Control+K Control+S</mo-key>`
}

export const OnColoredSurfaces: StoryObj = {
	render: () => html`
		<mo-flex gap='12px' alignItems='start'>
			<span>Keys derive their colors from the inherited one, so they stay legible on any surface.</span>
			<mo-flex direction='horizontal' alignItems='center' gap='12px'
				style='background: var(--mo-color-accent); color: var(--mo-color-on-accent); padding: 12px 16px; border-radius: var(--mo-border-radius)'>
				<span>Save</span>
				<mo-key>Meta+S</mo-key>
			</mo-flex>
			<mo-flex direction='horizontal' alignItems='center' gap='12px'
				style='background: var(--mo-color-surface-container-high); padding: 12px 16px; border-radius: var(--mo-border-radius)'>
				<span>Save</span>
				<mo-key>Meta+S</mo-key>
			</mo-flex>
		</mo-flex>
	`
}

export const Customized: StoryObj = {
	render: () => html`
		<mo-key style='--mo-key-color: var(--mo-color-foreground); --mo-key-background: var(--mo-color-accent-container); --mo-key-border-color: var(--mo-color-accent)'>Meta+P</mo-key>
	`
}