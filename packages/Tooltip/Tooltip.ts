import { component, css, property, html, unsafeCSS, Component, ifDefined, state, style } from '@a11d/lit'
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
	@property({ type: Boolean, reflect: true }) navigator = false

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
				border-radius: var(--mo-toolbar-border-radius, 6px);
				transition-duration: 175ms;
				transition-property: opacity, transform;
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
				background: var(--mo-tooltip-surface-color, var(--mo-color-surface));
				color: var(--mo-color-foreground);
				backdrop-filter: blur(40px);
				box-shadow: 0 0 12px 0 rgba(var(--mo-shadow-base), 0.2);
				padding: 8px;
			}

			:host([navigator]) mo-popover {
				background: rgba(0, 0, 0, 0.5);
				color: white;
			}

			* {
				font-size: 14px;
			}

			#triangle {
				clip-path: polygon(50% 0, 100% 100%, 0 100%);
				width: 15px;
				height: 7px;
				margin: 0 auto;
				position: absolute;
				background-color: white;
				color: white;
				transform: translateX(-50%);
				left: 50%;
				top: -7px;
			}

			:host([navigator]) #triangle {
				background: rgba(0, 0, 0, 0.5);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockStart)}"] #triangle {
				top: 100%;
				transform: scaleY(-1) translateX(-50%);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineStart)}"] #triangle {
				top: calc(50% - 3.5px);
				left: calc(100% - 4px);
				transform: rotate(90deg);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineEnd)}"] #triangle {
				top: calc(50% - 3.5px);
				left: -11px;
				transform: rotate(-90deg);
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
				<div id='triangle'></div>
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