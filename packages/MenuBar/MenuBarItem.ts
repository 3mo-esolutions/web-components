import { Component, component, css, html, query, queryAssignedElements, type PropertyValues } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import { type MenuBarMenuElement } from './MenuBarController.js'
import '@3mo/focus-ring'

/**
 * One menu of a `mo-menu-bar`: a trigger and the menu it opens, which is anchored to the trigger.
 *
 * @element mo-menu-bar-item
 *
 * @attr disabled - Whether the menu can be opened.
 *
 * @slot - The trigger's content, usually its label.
 * @slot menu - The menu this item opens.
 *
 * @csspart trigger - The button which opens the menu.
 */
@component('mo-menu-bar-item')
export class MenuBarItem extends Component {
	@disabledProperty() disabled = false

	override role = 'none'

	@query('[part=trigger]') readonly trigger!: HTMLButtonElement

	@queryAssignedElements({ slot: 'menu', flatten: true }) private readonly assignedMenus!: Array<HTMLElement>

	get menu() { return this.assignedMenus[0] as MenuBarMenuElement | undefined }

	/** The trigger's text, matched by typeahead. */
	get label() {
		return [...this.childNodes]
			.filter(node => !(node instanceof Element) || node.slot === '')
			.map(node => node.textContent ?? '')
			.join('')
			.trim()
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		const menu = this.menu
		if (menu && menu.anchor !== this.trigger) {
			menu.anchor = this.trigger
		}
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
			}

			:host([disabled]) {
				opacity: 0.5;
			}

			[part=trigger] {
				position: relative;
				display: inline-flex;
				align-items: center;
				gap: 0.25rem;
				min-height: 2rem;
				padding-inline: 0.75rem;
				border: none;
				border-radius: var(--mo-border-radius);
				background: transparent;
				color: inherit;
				font: inherit;
				white-space: nowrap;
				cursor: pointer;
				--mo-focus-ring-color: currentColor;

				&:disabled {
					cursor: unset;
				}

				&:hover:not(:disabled, [aria-expanded=true]) {
					background: var(--mo-color-transparent-gray-3);
				}

				&[aria-expanded=true] {
					background: var(--mo-color-selected);
					color: var(--mo-color-on-selected);
				}
			}
		`
	}

	protected override get template() {
		return html`
			<button part='trigger' tabindex='-1' ?disabled=${this.disabled}>
				<mo-focus-ring inward></mo-focus-ring>
				<slot></slot>
			</button>
			<slot name='menu' @slotchange=${() => this.requestUpdate()}></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-menu-bar-item': MenuBarItem
	}
}