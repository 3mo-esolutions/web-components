import { story, meta } from '../../.storybook/story.js'
import { Component, css, html, property, query } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { Menu } from '@3mo/menu'
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

export const WithContainer = story({
	render: () => {
		return html`
			<mo-popover-container placement='blockEnd'>
				<mo-button type='outlined'>Click to open the menu</mo-button>
				<mo-menu slot='popover'>
					${items}
				</mo-menu>
			</mo-popover-container>
		`
	}
})

export const Absolute = story({
	render: () => html`
		<mo-button-with-menu-story></mo-button-with-menu-story>
		<!-- ENCAPSULATED CODE:
			<mo-button id='button' type='outlined'>Click to open the menu</mo-button>
			<mo-menu .anchor=\${this} opener='button'>\${items}</mo-menu>
		-->
	`
})

export const Fixed = story({
	render: () => html`
		<mo-button-with-menu-story fixed></mo-button-with-menu-story>
		<!-- ENCAPSULATED CODE:
			<mo-button id='' type='outlined'>Click to open the menu</mo-button>
			<mo-menu .anchor=\${this} opener='button'>\${items}</mo-menu>
		-->
	`
})

export const Pointer = story({
	render: () => html`
		<mo-context-menu-story></mo-context-menu-story>
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
		<mo-list-submenu slot='detail'>
			More
			<mo-list-item slot='detail'>Open in New</mo-list-item>
			<mo-list-item slot='detail'>Report Issue</mo-list-item>
		</mo-list-submenu>
	</mo-list-submenu>
`

class ButtonWithMenuStory extends Component {
	@property({ type: Boolean }) fixed = false

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
		return html`
			<mo-button id='button' type='outlined'>Click to open the menu</mo-button>
			<mo-menu .anchor=${this} opener='button' ?fixed=${this.fixed}>${items}</mo-menu>
		`
	}
}

class ContextMenuStory extends Component {
	@query('mo-menu') readonly menu!: Menu

	static override get styles() {
		return css`
			width: 100vw;
			height: 100dvh;
		`
	}

	protected override get template() {
		return html`
			<div
				style='width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; border: dotted 2px currentColor; opacity: .7; border-radius: var(--mo-border-radius)'
				@contextmenu=${(e: PointerEvent) => this.menu.openWith(e)}
			>
				Right click anywhere
			</div>
			<mo-menu manualOpen .anchor=${this}>${items}</mo-menu>
		`
	}
}

customElements.define('mo-button-with-menu-story', ButtonWithMenuStory)
customElements.define('mo-context-menu-story', ContextMenuStory)