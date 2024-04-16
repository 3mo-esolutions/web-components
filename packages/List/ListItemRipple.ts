import { Component, component, css, eventListener, html, property, query } from '@a11d/lit'
import { type MdRipple } from '@material/web/ripple/ripple.js'

/**
 * @element mo-list-item-ripple
 *
 * @attr disabled - Whether the ripple is disabled
 * @attr preventClickOnSpace - Whether the ripple should prevent click on space
 * @attr focused - Whether the ripple is focused
 */
@component('mo-list-item-ripple')
export class ListItemRipple extends Component {
	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) preventClickOnSpace = false
	@property({
		type: Boolean,
		updated(this: ListItemRipple) {
			if (!this.disabled) {
				if (this.focused) {
					this.ripple['hovered'] = true
				} else {
					this.ripple['hovered'] = false
				}
			}
		}
	}) focused = false

	@query('md-ripple') readonly ripple!: MdRipple

	static override get styles() {
		return css`
			:host {
				display: block;
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				--_color: color-mix(in srgb, var(--mo-color-gray), var(--mo-color-accent) 25%);
				--md-ripple-focus-color: var(--_color);
				--md-ripple-hover-color: var(--_color);
				--md-ripple-pressed-color: var(--_color);
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
			<div></div>
			<md-ripple .control=${this} ?disabled=${this.disabled}></md-ripple>
		`
	}

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (this.disabled || !this.focused || event.repeat) {
			return
		}

		if (event.key === 'Enter' || (event.key === ' ' && !this.preventClickOnSpace)) {
			event.stopPropagation()
			this.ripple['pressed'] = true
			this.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
		}
	}

	@eventListener({ target: window, type: 'keyup' })
	protected handleKeyUp() {
		this.ripple['pressed'] = false
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-item-ripple': ListItemRipple
	}
}