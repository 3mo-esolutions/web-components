import type { Meta, StoryObj } from '@storybook/web-components'
import { Component, css, html, property, query } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Menu',
	component: 'mo-menu',
	package: p,
	decorators: [story => html`<div style='height: 400px'>${story()}</div>`]
} as Meta

export const WithContainer: StoryObj = {
	render: () => {
		return html`
			<mo-popover-container placement='block-end' alignment='end'>
				<mo-button type='outlined'>Click to open the menu</mo-button>
				<mo-menu slot='popover'>
					${items}
				</mo-menu>
			</mo-popover-container>
		`
	}
}

export const WithContainerFixed: StoryObj = {
	render: () => {
		return html`
			<mo-popover-container placement='block-end' alignment='end' fixed>
				<mo-button type='outlined'>Click to open the menu</mo-button>
				<mo-menu slot='popover'>
					${items}
				</mo-menu>
			</mo-popover-container>
		`
	}
}

export const WithCustomTarget: StoryObj = {
	render: () => {
		return html`
			<mo-popover-container placement='block-end' alignment='end' fixed>
				<mo-button type='outlined'>
					Click on the icon-button to open the menu
					<mo-icon-button id='icon-button' slot='trailing' icon='more_vert'></mo-icon-button>
				</mo-button>
				<mo-menu slot='popover' target='icon-button'>
					${items}
				</mo-menu>
			</mo-popover-container>
		`
	}
}

export const Absolute: StoryObj = {
	render: () => html`
		<story-button-with-menu></story-button-with-menu>
	`
}

export const Fixed: StoryObj = {
	render: () => html`
		<story-button-with-menu fixed></story-button-with-menu>
	`
}

const keyboardShortcut = (shortcut: string) => html`<span style='font-size: 13px; color: darkgray'>${shortcut}</span>`

const items = html`
	<mo-menu-item icon='content_cut'>
		<span style='flex: 1'>Cut</span>
		${keyboardShortcut('Ctrl + X')}
	</mo-menu-item>
	<mo-menu-item icon='content_copy'>
		<span style='flex: 1'>Copy</span>
		${keyboardShortcut('Ctrl + C')}
	</mo-menu-item>
	<mo-menu-item icon='content_paste'>
		<span style='flex: 1'>Paste</span>
		${keyboardShortcut('Ctrl + V')}
	</mo-menu-item>
	<div role='separator' style='width: 100%; height: 1px; background: darkgray; opacity: 0.3'></div>
	<mo-menu-item>Dictionary</mo-menu-item>
	<mo-menu-item>Thesaurus</mo-menu-item>
	<mo-nested-menu-item>(not) Sub-menu</mo-nested-menu-item>
	<mo-nested-menu-item>
		More
		<mo-menu-item slot='submenu'>Open in New</mo-menu-item>
		<mo-menu-item slot='submenu'>Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue Report Issue</mo-menu-item>
		<mo-nested-menu-item slot='submenu'>
			More
			<mo-menu-item slot='submenu'>Open in New</mo-menu-item>
			<mo-menu-item slot='submenu'>Report Issue</mo-menu-item>
		</mo-nested-menu-item>
	</mo-nested-menu-item>
`

class ButtonWithMenuStory extends Component {
	@property({ type: Boolean }) fixed = false

	static override get styles() {
		return css`
			:host {
				margin: 500px;
				display: inline-flex;
				flex-flow: column;
				position: relative;
				align-items: flex-end;
			}
		`
	}

	@query('mo-button') readonly button!: HTMLButtonElement

	override focus() {
		this.button.focus()
	}

	protected override get template() {
		return html`
			<mo-button id='button' type='outlined'>Click to open the menu</mo-button>
			<mo-menu .anchor=${this} target='button' ?fixed=${this.fixed} placement='inline-end' alignment='start'>${items}</mo-menu>
		`
	}
}

customElements.define('story-button-with-menu', ButtonWithMenuStory)