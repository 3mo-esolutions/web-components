import { component, Component, html, css, property, eventListener, unsafeCSS } from '@a11d/lit'

export const enum TooltipPosition {
	Top = 'top',
	Bottom = 'bottom',
	Right = 'right',
	Left = 'left',
}

@component('mo-tooltip')
export class Tooltip extends Component {
	private static readonly instancesContainer = new Set<Tooltip>()
	private static visibleInstance?: Tooltip

	@property({ type: Object }) anchor?: Element
	@property({ type: String, reflect: true }) position = TooltipPosition.Bottom

	@property({ type: Boolean, reflect: true }) protected rich = false
	@property({ type: Boolean, reflect: true }) protected visible = false
	private hover = false
	private anchorHover = false
	private anchorFocused = false

	constructor(anchor?: Element) {
		super()
		this.anchor = anchor
	}

	@eventListener('pointerenter')
	protected handlePointerEnter() {
		if (this.anchorHover) {
			this.hover = true
			this.updatePositionAndVisibility()
		}
	}

	@eventListener('pointerleave')
	protected handlePointerLeave() {
		this.hover = false
		this.updatePositionAndVisibility()
	}

	override connected() {
		Tooltip.instancesContainer.add(this)
		this.anchor?.addEventListener<any>('focus', this.handleAnchorFocus)
		this.anchor?.addEventListener<any>('blur', this.handleAnchorBlur)
		this.anchor?.addEventListener<any>('pointerenter', this.handleAnchorPointerEnter)
		this.anchor?.addEventListener<any>('pointermove', this.handleAnchorPointerMove)
		this.anchor?.addEventListener<any>('pointerleave', this.handleAnchorPointerLeave)
		this.anchor?.addEventListener<any>('pointerup', this.handleAnchorPointerLeave)
		this.anchor?.addEventListener<any>('click', this.handleAnchorPointerLeave)
	}

	override disconnected() {
		Tooltip.instancesContainer.delete(this)
		this.anchor?.removeEventListener<any>('focus', this.handleAnchorFocus)
		this.anchor?.removeEventListener<any>('blur', this.handleAnchorBlur)
		this.anchor?.removeEventListener<any>('pointerenter', this.handleAnchorPointerEnter)
		this.anchor?.removeEventListener<any>('pointermove', this.handleAnchorPointerMove)
		this.anchor?.removeEventListener<any>('pointerleave', this.handleAnchorPointerLeave)
		this.anchor?.removeEventListener<any>('pointerend', this.handleAnchorPointerLeave)
	}

	private readonly handleAnchorFocus = (e: any) => {
		if (!e.sourceCapabilities?.firesTouchEvents) {
			this.anchorFocused = true
			this.updatePositionAndVisibility()
		}
	}

	private readonly handleAnchorBlur = () => {
		this.anchorFocused = false
		this.updatePositionAndVisibility()
	}

	private readonly handleAnchorPointerEnter = () => {
		this.anchorHover = true
		this.updatePositionAndVisibility()
	}

	private readonly handleAnchorPointerMove = () => {
		this.updatePosition()
	}

	private readonly handleAnchorPointerLeave = () => {
		this.anchorHover = false
		this.updatePositionAndVisibility()
	}

	private updatePositionAndVisibility() {
		this.updatePosition()
		this.updateVisibility()
	}

	private updateVisibility() {
		const visible = this.anchorHover || this.hover || this.anchorFocused

		this.visible = visible
		if (visible) {
			Tooltip.visibleInstance = this
		}
		for (const tooltip of [...Tooltip.instancesContainer.values()].filter(t => t !== this)) {
			tooltip.visible = Tooltip.visibleInstance === tooltip
		}
	}

	private updatePosition() {
		const { left: anchorLeft, width: anchorWidth, top: anchorTop, height: anchorHeight } = this.anchor!.getBoundingClientRect()
		const { height: tooltipHeight, width: tooltipWidth } = this.getBoundingClientRect()

		// TODO: Support RTL

		const leftOf = (value: number) => Math.max(0, Math.min(value, window.innerWidth - tooltipWidth))
		const topOf = (value: number) => Math.max(0, Math.min(value, window.innerHeight - tooltipHeight))

		switch (this.position) {
			case TooltipPosition.Top:
				this.style.left = `${leftOf(anchorLeft + anchorWidth / 2 - tooltipWidth / 2)}px`
				this.style.top = `${topOf(anchorTop - tooltipHeight)}px`
				break
			case TooltipPosition.Bottom:
				this.style.left = `${leftOf(anchorLeft + anchorWidth / 2 - tooltipWidth / 2)}px`
				this.style.top = `${topOf(anchorTop + anchorHeight)}px`
				break
			case TooltipPosition.Left:
				this.style.left = `${leftOf(anchorLeft - tooltipWidth)}px`
				this.style.top = `${topOf(anchorTop + anchorHeight / 2 - tooltipHeight / 2)}px`
				break
			case TooltipPosition.Right:
				this.style.left = `${leftOf(anchorLeft + anchorWidth)}px`
				this.style.top = `${topOf(anchorTop + anchorHeight / 2 - tooltipHeight / 2)}px`
				break
		}
	}

	static override get styles() {
		return css`
			:host {
				pointer-events: none;
				position: fixed;
				transition-duration: 0.2s;
				transition-property: opacity, transform;
				transition-timing-function: ease-in-out;
				transform-origin: right center;
				opacity: 0;
				z-index: 99;
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));
			}

			:host([position="${unsafeCSS(TooltipPosition.Top)}"]) {
				transform: translateY(+10px);
			}

			:host([position="${unsafeCSS(TooltipPosition.Bottom)}"]) {
				transform: translateY(-10px);
			}

			:host([position="${unsafeCSS(TooltipPosition.Left)}"]) {
				transform: translateX(+10px);
			}

			:host([position="${unsafeCSS(TooltipPosition.Right)}"]) {
				transform: translateX(-10px);
			}

			:host(:not([rich])) {
				background: var(--mo-tooltip-surface-color, var(--mo-color-surface, rgba(255, 255, 255, 0.75)));
				backdrop-filter: blur(40px);
				color: var(--mo-color-foreground);
				box-shadow: var(--mo-tooltip-shadow, var(--mo-shadow-deep, 0px 5px 5px -3px rgba(95, 81, 78, 0.2), 0px 8px 10px 1px rgba(95, 81, 78, 0.14), 0px 3px 14px 2px rgba(95, 81, 78, 0.12)));
				padding: 8px;
			}

			:host([activate]) {
				transition-delay: 1s;
			}

			:host([visible]) {
				opacity: 1;
				transform: translate(0);
				transition-delay: 0s;
			}

			slot {
				display: block;
			}
		`
	}

	override get template() {
		return html`<slot @slotchange=${this.handleSlotChange}></slot>`
	}

	private readonly handleSlotChange = () => {
		this.updatePosition()
		this.rich = this.childElementCount > 0
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip': Tooltip
	}
}