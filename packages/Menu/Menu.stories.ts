import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, query } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Selection & Input / Menu',
	component: 'mo-menu',
	package: p,
	decorators: [story => html`<div style='height: 400px'>${story()}</div>`]
} as Meta

export const Menu: StoryObj = {
	render: () => {
		return html`
			<mo-popover-container placement='block-end' alignment='end'>
				<mo-button type='outlined'>Click to open the menu</mo-button>
				<mo-menu slot='popover' selectability='single'>
					${items}
				</mo-menu>
			</mo-popover-container>
		`
	}
}

export const WithCustomTarget: StoryObj = {
	render: () => {
		return html`
			<mo-popover-container placement='block-end' alignment='end'>
				<mo-button type='outlined'>
					Click on the icon-button to open the menu
					<mo-icon-button id='icon-button' slot='end' icon='more_vert'></mo-icon-button>
				</mo-button>
				<mo-menu slot='popover' target='icon-button' selectability='single'>
					${items}
				</mo-menu>
			</mo-popover-container>
		`
	}
}

export const WithCustomContainer: StoryObj = {
	render: () => html`
		<story-button-with-menu></story-button-with-menu>
	`
}

const keyboardShortcut = (shortcut: string) => html`<span slot='end' style='font-size: 13px; color: darkgray'>${shortcut}</span>`

const items = html`
	<mo-menu-item icon='content_cut'>
		Cut
		${keyboardShortcut('Ctrl + X')}
	</mo-menu-item>
	<mo-menu-item icon='content_copy'>
		Copy
		${keyboardShortcut('Ctrl + C')}
	</mo-menu-item>
	<mo-menu-item icon='content_paste'>
		Paste
		${keyboardShortcut('Ctrl + V')}
	</mo-menu-item>

	<mo-line></mo-line>

	<mo-menu-item>Dictionary</mo-menu-item>
	<mo-menu-item>Thesaurus</mo-menu-item>
	<mo-nested-menu-item>(not) Sub-menu</mo-nested-menu-item>
	<mo-nested-menu-item>
		More
		<mo-menu-item slot='submenu'>Open in New</mo-menu-item>
		<mo-menu-item slot='submenu'>Report Issue</mo-menu-item>
		<mo-nested-menu-item slot='submenu'>
			More
			<mo-menu-item slot='submenu'>Open in New</mo-menu-item>
			<mo-menu-item slot='submenu'>Report Issue</mo-menu-item>
		</mo-nested-menu-item>
	</mo-nested-menu-item>

	<mo-line></mo-line>

	<div style='opacity: 0.5; padding-inline: 1rem; padding-block: 0.75rem 0.25rem;'>Visibility</div>
	<mo-selectable-menu-item icon='lock' selected>Private</mo-selectable-menu-item>
	<mo-selectable-menu-item icon='groups'>Team</mo-selectable-menu-item>
	<mo-selectable-menu-item icon='public'>Public</mo-selectable-menu-item>
`

class ButtonWithMenuStory extends Component {
	static override get styles() {
		return css`
			:host {
				margin: 500px;
				display: inline-flex;
				flex-flow: column;
				position: relative;
				align-items: flex-end;
				anchor-name: --mo-button-with-menu;
			}

			mo-menu {
				position-anchor: --mo-button-with-menu;
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
			<mo-menu .anchor=${this} target='button' placement='inline-end' alignment='start'>${items}</mo-menu>
		`
	}
}

customElements.define('story-button-with-menu', ButtonWithMenuStory)