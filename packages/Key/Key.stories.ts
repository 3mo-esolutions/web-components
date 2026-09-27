import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Data / Key',
	component: 'mo-key',
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`<mo-key>Meta+K</mo-key>`,
}

/** `Meta` is the primary modifier, ⌘ on Apple platforms and Ctrl elsewhere, and modifiers follow the platform's order whatever order they are written in. `platform` overrides the detected one. */
export const Platforms: StoryObj = {
	render: () => html`
		<mo-key platform='apple'>Shift+Meta+P</mo-key>
		<mo-key platform='other'>Shift+Meta+P</mo-key>
	`,
}

/** `+` joins the keys of a chord, and whitespace separates keys pressed on their own, such as the arrows that move through a list. */
export const IndependentKeys: StoryObj = {
	render: () => html`
		<mo-key>ArrowUp ArrowDown</mo-key>
		<mo-key>Control+K Control+S</mo-key>
	`,
}

/** Keys are named as in `KeyboardEvent.key`: known ones take their platform's symbol or abbreviation, others such as `F5` show as written. A screen reader hears each by its name. */
export const SpecialKeys: StoryObj = {
	render: () => html`
		<mo-key>Escape</mo-key>
		<mo-key>Enter</mo-key>
		<mo-key>Tab</mo-key>
		<mo-key>Backspace</mo-key>
		<mo-key>ArrowUp ArrowDown ArrowLeft ArrowRight</mo-key>
		<mo-key>PageUp PageDown</mo-key>
		<mo-key>F5</mo-key>
	`,
}

/** `separator` replaces what stands between the keys of a chord, none on Apple platforms and `+` elsewhere by default. */
export const Separator: StoryObj = {
	render: () => html`<mo-key separator='-'>Control+X Control+S</mo-key>`,
}

/** Keys take their colors from the inherited one, so they stay legible on any surface. */
export const ColoredSurfaces: StoryObj = {
	render: () => html`
		<div style='display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--mo-border-radius); background: var(--mo-color-accent); color: var(--mo-color-on-accent)'>
			Save
			<mo-key>Meta+S</mo-key>
		</div>
		<div style='display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--mo-border-radius); background: var(--mo-color-surface-container-high)'>
			Save
			<mo-key>Meta+S</mo-key>
		</div>
	`,
}

/** The keycaps' colors and font are custom properties. */
export const CustomProperties: StoryObj = {
	render: () => html`
		<mo-key style='--mo-key-color: var(--mo-color-foreground); --mo-key-background: var(--mo-color-accent-container); --mo-key-border-color: var(--mo-color-accent)'>Meta+P</mo-key>
		<mo-key style='--mo-key-font-family: serif'>Alt+F4</mo-key>
	`,
}