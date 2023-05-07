import { story, meta } from '../../.storybook/story.js'
import { Component, css, html, query, state } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Menu',
	component: 'mo-menu',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	},
})

export const Default = story({
	render: () => html`<mo-button-with-menu-story></mo-button-with-menu-story>`
})

class ButtonWithMenuStory extends Component {
	@state() open = false

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
			}
		`
	}

	@query('mo-button') readonly button!: HTMLButtonElement

	override focus() {
		this.button.focus()
	}

	protected override get template() {
		const keyboardShortcut = (shortcut: string) => html`
			<span style='font-size: 13px; color: darkgray'>${shortcut}</span>
		`

		const separator = html`
			<div role='separator' style='width: 100%; height: 1px; background: darkgray; opacity: 0.3'></div>
		`

		const items = html`
			<mo-list-item>
				<mo-icon style='opacity: 0.66' icon='content_cut'></mo-icon>
				<span style='flex: 1'>Cut</span>
				${keyboardShortcut('Ctrl + X')}
			</mo-list-item>
			<mo-list-item>
				<mo-icon style='opacity: 0.66' icon='content_copy'></mo-icon>
				<span style='flex: 1'>Copy</span>
				${keyboardShortcut('Ctrl + C')}
			</mo-list-item>
			<mo-list-item>
				<mo-icon style='opacity: 0.66' icon='content_paste' ${tooltip('Paste')}></mo-icon>
				<span style='flex: 1'>Paste</span>
				${keyboardShortcut('Ctrl + V')}
			</mo-list-item>
			${separator}
			<mo-list-item>Dictionary</mo-list-item>
			<mo-list-item>Thesaurus</mo-list-item>
			<mo-list-submenu>
				More Actions
				<mo-list-item slot='menu'>Open in New</mo-list-item>
				<mo-list-item slot='menu'>Report Issue</mo-list-item>
			</mo-list-submenu>
		`
		return html`
			<mo-popover-host>
				<mo-button type='outlined'>Click to open the menu</mo-button>
				<mo-menu ?open=${this.open} slot='popover'>${items}</mo-menu>
			</mo-popover-host>
		`
	}
}

customElements.define('mo-button-with-menu-story', ButtonWithMenuStory)