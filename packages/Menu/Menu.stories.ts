import { story, meta } from '../../.storybook/story.js'
import { Component, css, html, property, query } from '@a11d/lit'
import { Menu } from '@3mo/menu'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Menu',
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
			<mo-popover-container placement='block-end' alignment='end'>
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
		<mo-menu-item slot='submenu'>Report Issue</mo-menu-item>
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
			<mo-menu .anchor=${this} opener='button' ?fixed=${this.fixed} palcement='top' alignment='end'>${items}</mo-menu>
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
			<mo-menu fixed manualOpen .anchor=${this}>${items}</mo-menu>
		`
	}
}

customElements.define('mo-button-with-menu-story', ButtonWithMenuStory)
customElements.define('mo-context-menu-story', ContextMenuStory)