import { story, meta } from '../../.storybook/story.js'
import { Component, css, html, property, query } from '@a11d/lit'
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

export const Hosted = story({
	render: () => {
		return html`
			<mo-popover-host placement='blockEnd'>
				<mo-button type='outlined'>Click to open the menu</mo-button>
				<mo-menu slot='popover'>
					${items}
				</mo-menu>
			</mo-popover-host>
		`
	}
})

export const Manual = story({
	render: () => html`
		<mo-button-with-menu-story managed></mo-button-with-menu-story>
		<!-- ENCAPSULATED CODE:
			<mo-button id='button' type='outlined'>Click to open the menu</mo-button>
			<mo-menu .anchor=\${this} opener='button' managed>\${items}</mo-menu>
		-->
	`
})

export const Fixed = story({
	render: () => html`
		<mo-button-with-menu-story></mo-button-with-menu-story>
		<!-- ENCAPSULATED CODE:
			<mo-button id='' type='outlined'>Click to open the menu</mo-button>
			<mo-menu .anchor=\${this} opener='button'>\${items}</mo-menu>
		-->
	`
})


const keyboardShortcut = (shortcut: string) => html`<span style='font-size: 13px; color: darkgray'>${shortcut}</span>`

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
					<div role='separator' style='width: 100%; height: 1px; background: darkgray; opacity: 0.3'></div>
					<mo-list-item>Dictionary</mo-list-item>
					<mo-list-item>Thesaurus</mo-list-item>
					<mo-list-submenu>
						More
						<mo-list-item slot='detail'>Open in New</mo-list-item>
						<mo-list-item slot='detail'>Report Issue</mo-list-item>
					</mo-list-submenu>
`

class ButtonWithMenuStory extends Component {
	@property({ type: Boolean }) managed = false

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

	get rawTemplate() {
		return this.template
	}

	protected override get template() {
		return html`
			<mo-button id='button' type='outlined'>Click to open the menu</mo-button>
			<mo-menu .anchor=${this} opener='button' ?managed=${this.managed}>${items}</mo-menu>
		`
	}
}

customElements.define('mo-button-with-menu-story', ButtonWithMenuStory)