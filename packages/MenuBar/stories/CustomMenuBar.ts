import { Component, component, css, html, property, query, type PropertyValues } from '@a11d/lit'
import { MenuBarController } from '@3mo/menu-bar'
import '@3mo/menu'

/** A menu bar of your own: `MenuBarController` applies the pattern to the plain buttons it renders. */
@component('story-custom-menu-bar')
export class CustomMenuBar extends Component {
	private readonly labels = ['File', 'Edit', 'View']

	readonly menuBarController: MenuBarController<CustomMenuBarItem, CustomMenuBar> = new MenuBarController(this, host => ({
		get items() { return [...host.renderRoot.querySelectorAll<CustomMenuBarItem>('story-custom-menu-bar-item')] },
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
export class CustomMenuBarItem extends Component {
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
			<mo-menu>
				<mo-menu-item>${this.label} 1</mo-menu-item>
				<mo-menu-item>${this.label} 2</mo-menu-item>
			</mo-menu>
		`
	}
}
