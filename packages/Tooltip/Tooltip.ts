import { component, css, property, html, Component, state, bind, ifDefined, query, event } from '@a11d/lit'
import { type TooltipPlacement } from './TooltipPlacement.js'
import { type FocusMethod, FocusController } from '@3mo/focus-controller'
import { PointerController } from '@3mo/pointer-controller'
import { type ComputePositionReturn, arrow, type Middleware } from '@floating-ui/core'
import * as System from 'detect-browser'

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
	private static readonly tipSideByPlacement = new Map([
		['top', 'bottom'],
		['right', 'left'],
		['bottom', 'top'],
		['left', 'right'],
	])

	@event({ bubbles: true }) readonly openChange!: EventDispatcher<boolean>

	@property() placement?: TooltipPlacement
	@property({ type: Object }) anchor?: HTMLElement

	@property({ type: Boolean, reflect: true }) rich = false

	@state() open = false

	@query('#tip') private readonly arrowElement!: HTMLDivElement

	protected lastFocusMethod?: FocusMethod
	protected readonly anchorFocusController = new FocusController(this, {
		target: targetAnchor,
		handleChange: (_, __, method) => {
			this.lastFocusMethod = method
			this.openIfApplicable()
		},
	})

	private get isMobile() {
		const osName = System.detect()?.os
		return osName && ['iOS', 'Android OS', 'BlackBerry OS', 'Windows Mobile', 'Amazon OS'].includes(osName)
	}

	private handleOpen = () => {
		if (this.pointerController.type === 'touch') {
			this.setOpen(this.anchorPointerController.press)
			return
		}

		if (this.lastFocusMethod === 'keyboard' && this.anchorFocusController.focused) {
			this.setOpen(true)
			return
		}

		this.setOpen(this.pointerController.hover || this.anchorPointerController.hover)
	}

	private openIfApplicable = () => {
		if (this.isMobile) {
			return requestAnimationFrame(() => this.handleOpen())
		}

		return this.handleOpen()
	}

	private setOpen(open: boolean) {
		if (this.open !== open) {
			this.open = open
			this.openChange.dispatch(open)
		}
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
			mo-popover {
				border-radius: var(--mo-toolbar-border-radius, calc(var(--mo-border-radius) - 0px));
				transition-duration: 175ms;
				transition-property: opacity, transform;
				padding: var(--mo-tooltip-spacing, 0.3125rem 0.5rem);
				font-size: var(--mo-tooltip-font-size, 0.82rem);
				background: var(--mo-tooltip-surface-color, var(--_tooltip-default-background));
				transition-property: opacity, transform;
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
				transform: rotate(45deg);
				position: absolute;
				background: var(--mo-tooltip-surface-color, var(--_tooltip-default-background));
				width: 6px;
				height: 6px;
			}
		`
	}

	@state() private positionMiddleware?: Array<Middleware>

	protected override initialized() {
		this.positionMiddleware = [arrow({ element: this.arrowElement })]
	}

	protected override get template() {
		return html`
			<mo-popover fixed manual
				?open=${bind(this, 'open')}
				.anchor=${this.anchor}
				placement=${ifDefined(this.placement)}
				alignment='center'
				.positionMiddleware=${this.positionMiddleware}
				.positionComputed=${this.positionComputed}
			>
				<div id='tip'></div>
				<slot @slotchange=${this.handleSlotChange}></slot>
			</mo-popover>
		`
	}

	private readonly positionComputed = (response: ComputePositionReturn) => {
		if (this.arrowElement) {
			const { x: arrowX, y: arrowY } = response.middlewareData.arrow ?? { x: null, y: null }

			this.arrowElement.style.left = arrowX !== null ? `${arrowX}px` : ''
			this.arrowElement.style.top = arrowY !== null ? `${arrowY}px` : ''

			const staticSide = Tooltip.tipSideByPlacement.get(response.placement!.split('-')[0] as any)
			this.arrowElement.style[staticSide as any] = '-3px'
		}
	}

	private readonly handleSlotChange = () => {
		this.rich = !!this.children.length && [...this.children].some(child => child.nodeType !== Node.TEXT_NODE)

		const textContent = this.rich ? undefined : this.textContent?.trim() ?? undefined

		if (textContent) {
			this.anchor?.setAttribute('aria-label', textContent)
		} else {
			this.anchor?.removeAttribute('aria-label')
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip': Tooltip
	}
}