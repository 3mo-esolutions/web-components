import { Component, component, css, eventListener, html, property, query } from '@a11d/lit'
import { ripple } from '@material/web/ripple/directive.js'
import { Ripple } from '@material/web/ripple/lib/ripple.js'
import '@material/web/ripple/ripple.js'

/**
 * @element mo-list-item-ripple
 *
 * @attr disabled - Whether the ripple is disabled
 * @attr focused - Whether the ripple is focused
 */
@component('mo-list-item-ripple')
export class ListItemRipple extends Component {
	@property({ type: Boolean }) disabled = false
	@property({
		type: Boolean,
		updated(this: ListItemRipple) {
			if (!this.disabled) {
				if (this.focused) {
					this.ripple.handleFocusin()
				} else {
					this.ripple.handleFocusout()
				}
			}
		}
	}) focused = false

	@query('md-ripple') readonly ripple!: Ripple

	static override get styles() {
		return css`
			:host {
				display: block;
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				--md-ripple-focus-color: var(--mo-color-gray);
				--md-ripple-hover-color: var(--mo-color-gray);
				--md-ripple-pressed-color: var(--mo-color-gray);
			}

			md-ripple {
				display: block;
				width: 100%;
				height: 100%;
				pointer-events: none;
			}

			div {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
			}
		`
	}

	protected override get template() {
		return html`
			<div ${ripple(() => this.ripple)}></div>
			<md-ripple ?disabled=${this.disabled}></md-ripple>
		`
	}

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (this.disabled || !this.focused || event.repeat) {
			return
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.stopPropagation()
			this.ripple['startPressAnimation'](event)
			this.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
		}
	}

	@eventListener({ target: window, type: 'keyup' })
	protected handleKeyUp() {
		this.ripple['endPressAnimation']()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-item-ripple': ListItemRipple
	}
}