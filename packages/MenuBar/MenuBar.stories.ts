import { type Meta, type StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property, query, style, type PropertyValues } from '@a11d/lit'
import { MenuBarController } from './MenuBarController.js'
import p from './package.json'
import '@3mo/menu'
import '@3mo/line'
import '@3mo/flex'
import './index.js'

export default {
	title: 'Layout & Containment / Menu Bar',
	component: 'mo-menu-bar',
	package: p,
} as Meta

const menuStyle = style({ color: 'var(--mo-color-foreground)' })

export const Default: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Once a menu is open, hovering or pressing the arrows opens its neighbours. Home, End and typing a letter move the cursor without opening anything.'
			}
		}
	},
	render: () => html`
		<mo-menu-bar aria-label='Editor'>
			<mo-menu-bar-item>
				File
				<mo-menu slot='menu' ${menuStyle}>
					<mo-menu-item icon='note_add'>New</mo-menu-item>
					<mo-nested-menu-item icon='folder_open'>
						Open recent
						<mo-menu-item slot='submenu'>Invoice 2026-08.pdf</mo-menu-item>
						<mo-menu-item slot='submenu'>Delivery notes.csv</mo-menu-item>
						<mo-menu-item slot='submenu'>Stock report.xlsx</mo-menu-item>
					</mo-nested-menu-item>
					<mo-line></mo-line>
					<mo-menu-item icon='save'>Save</mo-menu-item>
					<mo-menu-item icon='print'>Print</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>

			<mo-menu-bar-item>
				Edit
				<mo-menu slot='menu' ${menuStyle}>
					<mo-menu-item icon='undo'>Undo</mo-menu-item>
					<mo-menu-item icon='redo'>Redo</mo-menu-item>
					<mo-line></mo-line>
					<mo-menu-item icon='content_cut'>Cut</mo-menu-item>
					<mo-menu-item icon='content_copy'>Copy</mo-menu-item>
					<mo-menu-item icon='content_paste'>Paste</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>

			<mo-menu-bar-item>
				View
				<mo-menu slot='menu' selectability='multiple' ${menuStyle}>
					<mo-selectable-menu-item selected>Toolbar</mo-selectable-menu-item>
					<mo-selectable-menu-item>Status bar</mo-selectable-menu-item>
					<mo-line></mo-line>
					<mo-menu-item icon='zoom_in'>Zoom in</mo-menu-item>
					<mo-menu-item icon='zoom_out'>Zoom out</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>

			<mo-menu-bar-item disabled>
				Tools
				<mo-menu slot='menu' ${menuStyle}>
					<mo-menu-item>Nothing here yet</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>

			<mo-menu-bar-item>
				Help
				<mo-menu slot='menu' ${menuStyle}>
					<mo-menu-item icon='help'>Documentation</mo-menu-item>
					<mo-menu-item icon='info'>About</mo-menu-item>
				</mo-menu>
			</mo-menu-bar-item>
		</mo-menu-bar>
	`
}

export const Overflow: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Resize the container. Menus which do not fit are hidden and skipped by the cursor, and `overflowChange` reports it so the application can offer them elsewhere.'
			}
		}
	},
	render: () => {
		const verdict = document.createElement('span')
		verdict.textContent = 'fits'
		return html`
			<mo-flex gap='1rem' ${style({ maxWidth: '400px' })}>
				<div ${style({ resize: 'horizontal', overflow: 'hidden', minWidth: '80px', padding: '4px', border: '1px dashed var(--mo-color-transparent-gray-3)', borderRadius: 'var(--mo-border-radius)' })}>
					<mo-menu-bar aria-label='Editor'
						@overflowChange=${(e: CustomEvent<boolean>) => verdict.textContent = e.detail ? 'does not fit' : 'fits'}
					>
						${['File', 'Edit', 'Selection', 'View', 'Window', 'Help'].map(label => html`
							<mo-menu-bar-item>
								${label}
								<mo-menu slot='menu' ${menuStyle}>
									<mo-menu-item>${label} command</mo-menu-item>
								</mo-menu>
							</mo-menu-bar-item>
					`)}
					</mo-menu-bar>
				</div>
				<mo-flex direction='horizontal' gap='0.5rem' ${style({ fontSize: '0.875rem' })}>
					<span ${style({ color: 'var(--mo-color-gray)' })}>Last verdict:</span>
					${verdict}
				</mo-flex>
			</mo-flex>
	`
	}
}

@component('story-custom-menu-bar')
class StoryCustomMenuBar extends Component {
	private readonly labels = ['Datei', 'Bearbeiten', 'Ansicht']

	readonly menuBarController: MenuBarController = new MenuBarController(this, host => ({
		get items() { return [...host.renderRoot.querySelectorAll<StoryCustomMenuBarItem>('story-custom-menu-bar-item')] },
	}))

	static override get styles() {
		return css`
			:host {
				display: flex;
				align-items: center;
				gap: 2px;
				padding: 2px;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1);
				font-size: 0.875rem;
			}
		`
	}

	protected override get template() {
		return html`
			${this.labels.map(label => html`
				<story-custom-menu-bar-item .label=${label}></story-custom-menu-bar-item>
			`)}
		`
	}
}

@component('story-custom-menu-bar-item')
class StoryCustomMenuBarItem extends Component {
	@property() label = ''

	@query('button') readonly trigger!: HTMLButtonElement
	@query('mo-menu') readonly menu!: HTMLElementTagNameMap['mo-menu']

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		if (this.menu.anchor !== this.trigger) {
			this.menu.anchor = this.trigger
		}
	}

	static override get styles() {
		return css`
			button {
				border: none;
				border-radius: var(--mo-border-radius);
				padding: 0.35rem 0.6rem;
				background: transparent;
				color: inherit;
				font: inherit;
				cursor: pointer;

				&[aria-expanded=true], &:hover {
					background: var(--mo-color-transparent-gray-3);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<button tabindex='-1'>${this.label}</button>
			<mo-menu ${menuStyle}>
				<mo-menu-item>${this.label} 1</mo-menu-item>
				<mo-menu-item>${this.label} 2</mo-menu-item>
			</mo-menu>
		`
	}
}

export const WithController: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: '`MenuBarController` applies the pattern to items of your own, here plain buttons rendered by a custom component.'
			}
		}
	},
	render: () => html`<story-custom-menu-bar></story-custom-menu-bar>`
}

declare global {
	interface HTMLElementTagNameMap {
		'story-custom-menu-bar': StoryCustomMenuBar
		'story-custom-menu-bar-item': StoryCustomMenuBarItem
	}
}