import { component, css, property, html, unsafeCSS, Component, ifDefined, state } from '@a11d/lit'
import { PopoverPlacement } from '@3mo/popover'
import { TooltipPlacement } from './TooltipPlacement.js'
import { FocusMethod, FocusController } from '@3mo/focus-controller'
import { PointerController } from '@3mo/pointer-controller'

function targetAnchor(this: Tooltip) {
	return this.anchor || []
}

/**
 * @element mo-tooltip
 *
 * @attr placement - The placement of the tooltip.
 * @attr anchor - The element id that the tooltip is anchored to.
 *
 * @slot - Default slot for tooltip content
 */
@component('mo-tooltip')
export class Tooltip extends Component {
	@property() placement?: TooltipPlacement
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
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius));
				transition-duration: 175ms;
				transition-property: opacity, transform;
				box-shadow: none;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockStart)}"] {
				transform: translateY(+10px);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockEnd)}"] {
				transform: translateY(-10px);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineStart)}"] {
				transform: translateX(+10px);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineEnd)}"] {
				transform: translateX(-10px);
			}

			mo-popover[open] {
				transform: translate(0);
			}

			:host(:not([rich])) mo-popover {
				pointer-events: none;
				background: var(--mo-tooltip-color-surface, rgb(109, 109, 109));
				color: white;
				padding: var(--mo-tooltip-spacing, 0.3125rem 0.5rem);
				font-size: var(--mo-tooltip-font-size, 0.75rem);
			}

			#tip {
				clip-path: polygon(-5% 0px, -5% 100%, 50% 50%);
				width: 8px;
				height: 8px;
				margin: 0 auto;
				position: absolute;
				background-color: var(--mo-tooltip-color-surface, rgb(109, 109, 109));
				z-index: 9999;
				top: 0;
				transform: translate(-50%, -100%) rotate(-90deg);
				left: 50%;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockStart)}"] #tip {
				top: 100%;
				transform: translateX(-50%) scale(-1) rotate(-90deg);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineStart)}"] #tip {
				transform: rotate(360deg) translateY(-50%);
    		left: 100%;
    		top: 50%;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineEnd)}"] #tip {
				left: -8px;
				transform: rotate(180deg) translateY(-100%);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-popover fixed manual
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
				.anchor=${this.anchor}
				placement=${ifDefined(this.placement)}
				alignment='center'
			>
				<div id='tip'></div>
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