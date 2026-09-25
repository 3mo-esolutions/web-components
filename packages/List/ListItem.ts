import { Component, component, css, eventListener, html, property } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import type { MaterialIcon } from '@3mo/icon'
import './ListItemRipple.js'

/**
 * @element mo-list-item
 *
 * @attr disabled - Whether the list item is disabled
 * @attr icon - Icon to be displayed in the list item
 * @attr preventClickOnSpace - Whether the list item should prevent click on space
 *
 * @slot - Default slot for content
 */
@component('mo-list-item')
export class ListItem extends Component {
	@disabledProperty({ blockFocus: true }) disabled = false
	@property() icon?: MaterialIcon
	@property({ type: Boolean }) preventClickOnSpace = false
	/** Keyboard focus, real or, in a combobox, the active option's. */
	@property({ type: Boolean, attribute: 'data-keyboard-focus', reflect: true }) protected keyboardFocus = false

	override role = 'listitem'
	override tabIndex = 0

	static override get styles() {
		return css`
			:host {
				position: relative;
				width: 100%;
				box-sizing: border-box;
				user-select: none;
				padding-inline: 1rem;
				padding-block: 0.48em;
				display: flex;
				gap: 1rem;
				align-items: center;
				min-height: 3rem;
			}

			:host([disabled]) {
				pointer-events: none;
				opacity: 0.5;
			}

			:host([data-navigability=current]) {
				background-color: var(--mo-color-transparent-gray);
			}

			:host(:focus) {
				outline: none;
			}
		`
	}

	@eventListener('focus')
	protected handleFocus() {
		this.keyboardFocus = this.matches(':focus-visible')
	}

	@eventListener('blur')
	protected handleBlur() {
		this.keyboardFocus = false
	}

	@eventListener('keydown')
	protected handleKeyDown(event: KeyboardEvent) {
		if (event.target !== this || event.defaultPrevented || event.repeat || this.activatedAround) {
			return
		}
		if (event.key === 'Enter' || (event.key === ' ' && !this.preventClickOnSpace)) {
			event.preventDefault()
			this.click()
		}
	}

	/** A listbox, a menu or a tree activates its own items; a plain list, or none at all, leaves it to the item. */
	private get activatedAround() {
		for (let node: Node | null = this.assignedSlot ?? this.parentNode; node; node = (node as Element).assignedSlot ?? node.parentNode ?? (node as ShadowRoot).host ?? null) {
			const role = node instanceof Element ? node.getAttribute('role') : null
			if (role === 'list') {
				return false
			}
			if (role === 'listbox' || role === 'menu' || role === 'menubar' || role === 'tree') {
				return true
			}
		}
		return false
	}

	protected override get template() {
		return html`
			${!this.keyboardFocus ? html.nothing : html`<mo-focus-ring inward visible></mo-focus-ring>`}
			<mo-list-item-ripple ?disabled=${this.disabled}></mo-list-item-ripple>
			${this.iconTemplate}
			<slot></slot>
		`
	}

	protected get iconTemplate() {
		return !this.icon ? html.nothing : html`
			<mo-icon part='icon' style='opacity: 0.66' icon=${this.icon}></mo-icon>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-item': ListItem
	}
}