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

	@property({ type: Boolean, reflect: true }) rich = false

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
				border-radius: var(--mo-toolbar-border-radius, calc(var(--mo-border-radius) - 1px));
				transition-duration: 175ms;
				transition-property: opacity, transform;
				padding: var(--mo-tooltip-spacing, 0.3125rem 0.5rem);
				font-size: var(--mo-tooltip-font-size, 0.82rem);
				background: var(--mo-tooltip-surface-color, var(--_tooltip-default-background));
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
				color: var(--mo-color-background);
				--_tooltip-default-background: var(--mo-color-foreground);
			}

			:host([rich]) mo-popover {
				--_tooltip-default-background: var(--mo-color-surface);
			}

			#tip {
				clip-path: polygon(-5% 0px, -5% 100%, 50% 50%);
				width: 8px;
				height: 8px;
				margin: 0 auto;
				position: absolute;
				background: var(--mo-tooltip-surface-color, var(--_tooltip-default-background));
				z-index: 1;
				inset-block-start: 0;
				transform: translate(-50%, -100%) rotate(-90deg);
				inset-inline-start: 50%;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockStart)}"] #tip {
				inset-block-start: 100%;
				transform: translateX(-50%) scale(-1) rotate(-90deg);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineStart)}"] #tip {
				transform: rotate(360deg) translateY(-50%);
				inset-inline-start: 100%;
				inset-block-start: 50%;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineEnd)}"] #tip {
				inset-inline-start: -8px;
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
				<slot></slot>
			</mo-popover>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip': Tooltip
	}
}