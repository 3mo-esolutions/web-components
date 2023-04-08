import { component, css, property, eventListener, html, unsafeCSS, Component } from '@a11d/lit'
import { PopoverController, PopoverPlacement } from '@3mo/popover'
import { TooltipPlacement } from './TooltipPlacement.js'

@component('mo-tooltip')
export class Tooltip extends Component {
	private static readonly instancesContainer = new Set<Tooltip>()
	private static openInstance?: Tooltip

	@property({ type: Object }) anchor!: HTMLElement
	@property({ reflect: true }) placement = TooltipPlacement.Bottom
	@property({
		type: Boolean,
		reflect: true,
		updated(this: Tooltip) {
			if (this.open) {
				Tooltip.openInstance = this
			}

			for (const tooltip of [...Tooltip.instancesContainer.values()].filter(t => t !== this)) {
				tooltip.open = Tooltip.openInstance === tooltip
			}
		}
	}) open = false

	@property({ type: Boolean, reflect: true }) protected rich = false

	protected readonly popoverController = new PopoverController(this, {
		openOnFocus: true,
		openOnHover: true,
		getPositionOffset: {
			left: (anchorRect, popoverRect) => anchorRect.width / 2 - popoverRect.width / 2,
			top: (anchorRect, popoverRect) => anchorRect.height / 2 - popoverRect.height / 2
		}
	})

	protected override connected() {
		Tooltip.instancesContainer.add(this)
	}

	protected override disconnected() {
		Tooltip.instancesContainer.delete(this)
	}

	static override get styles() {
		return css`
			:host {
				pointer-events: none;
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));
				opacity: 0;
				transition-duration: 175ms;
				transition-property: opacity, transform;
				position: fixed;
				z-index: 99;
			}

			:host(:not([open])) {
				pointer-events: none;
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Top)}"]) {
				transform: translateY(+10px);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Bottom)}"]) {
				transform: translateY(-10px);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Left)}"]) {
				transform: translateX(+10px);
			}

			:host([placement="${unsafeCSS(PopoverPlacement.Right)}"]) {
				transform: translateX(-10px);
			}

			:host([open]) {
				opacity: 1;
				transform: translate(0);
			}

			slot {
				display: block;
			}

			:host(:not([rich])) {
				background: var(--mo-tooltip-surface-color, var(--mo-color-surface, rgba(255, 255, 255, 0.75)));
				backdrop-filter: blur(40px);
				color: var(--mo-color-foreground);
				box-shadow: var(--mo-tooltip-shadow, var(--mo-shadow-deep, 0px 5px 5px -3px rgba(95, 81, 78, 0.2), 0px 8px 10px 1px rgba(95, 81, 78, 0.14), 0px 3px 14px 2px rgba(95, 81, 78, 0.12)));
				padding: 8px;
			}
		`
	}

	@eventListener('slotchange')
	protected handleSlotChange() {
		this.rich = this.childElementCount > 0
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip': Tooltip
	}
}