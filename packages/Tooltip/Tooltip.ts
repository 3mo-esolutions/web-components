import { component, css, property, html, Component, state } from '@a11d/lit'
import { FocusMethod, FocusController } from '@3mo/focus-controller'
import { PointerController } from '@3mo/pointer-controller'

function targetAnchor(this: Tooltip) {
	return this.anchor || []
}

/**
 * @element mo-tooltip
 *
 * @attr anchor - The element id that the tooltip is anchored to.
 *
 * @slot - Default slot for tooltip content
 */
@component('mo-tooltip')
export class Tooltip extends Component {
	@property({ type: Object }) anchor?: HTMLElement

	@property({ type: Boolean, reflect: true }) protected rich?: boolean

	@state() private open = false

	protected lastFocusMethod?: FocusMethod
	protected readonly anchorFocusController = new FocusController(this, {
		target: targetAnchor,
		handleChange: (_, __, method) => {
			this.lastFocusMethod = method
			this.openIfApplicable()
		},
	})

	private openIfApplicable = () => {
		if (this.pointerController.type === 'touch') {
			this.open = this.anchorPointerController.press
			return
		}

		if (this.lastFocusMethod === 'keyboard' && this.anchorFocusController.focused) {
			this.open = true
			return
		}

		this.open = this.pointerController.hover || this.anchorPointerController.hover
	}

	protected readonly pointerController = new PointerController(this, {
		handleHoverChange: this.openIfApplicable,
		handlePressChange: this.openIfApplicable,
	})

	protected readonly anchorPointerController = new PointerController(this, {
		target: targetAnchor,
		handleHoverChange: this.openIfApplicable,
		handlePressChange: this.openIfApplicable,
	})

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}

			mo-popover {
				pointer-events: none;
				color: white;
				padding: var(--mo-tooltip-spacing, 0.3125rem 0.5rem);
				font-size: var(--mo-tooltip-font-size, 0.75rem);
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius));
				transition-duration: 175ms;
				transition-property: opacity, transform;
				box-shadow: none;
				transform: translateZ(0);
			}

			#tip {
				transform: rotate(45deg);
				position: absolute;
				width: 6px;
  			height: 6px;
			}

			mo-popover, #tip {
				background-color: var(--mo-tooltip-color-surface, rgb(109, 109, 109));
			}
		`
	}

	protected override get template() {
		return html`
			<mo-popover fixed manual
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
				.anchor=${this.anchor}
				alignment='center'
			>
				<div id='tip' part='arrow'></div>
				<slot @slotChange=${() => this.rich = this.childElementCount > 0}></slot>
			</mo-popover>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip': Tooltip
	}
}