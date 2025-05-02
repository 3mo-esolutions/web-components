import { component, css, property, html, Component, state, bind, ifDefined, event } from '@a11d/lit'
import { type FocusMethod, FocusController } from '@3mo/focus-controller'
import { PointerController } from '@3mo/pointer-controller'
import { type TooltipPlacement } from './TooltipPlacement.js'

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
	@event({ bubbles: true }) readonly openChange!: EventDispatcher<boolean>

	@property() placement?: TooltipPlacement
	@property({ type: Object }) anchor?: HTMLElement

	@property({ type: Boolean, reflect: true }) rich = false

	@state() open = false

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
			this.setOpen(this.anchorPointerController.press)
			return
		}

		if (this.lastFocusMethod === 'keyboard' && this.anchorFocusController.focused) {
			this.setOpen(true)
			return
		}

		this.setOpen(this.pointerController.hover || this.anchorPointerController.hover)
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
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius));
				transition-duration: 175ms;
				transition-property: opacity, transform;
				padding: 0.3125rem 0.5rem;
				font-size: var(--mo-tooltip-font-size, 0.82rem);
				background: var(--_tooltip-default-background);
				transition-property: opacity, transform;

				&::part(arrow) {
					display: block;
					width: var(--_tooltip-default-tip-size);
				}
			}

			:host(:not([rich])) mo-popover {
				pointer-events: none;
				color: var(--mo-color-background);
				--_tooltip-default-background: var(--mo-color-foreground);
				--_tooltip-default-tip-size: 0.75rem;
			}

			:host([rich]) mo-popover {
				--_tooltip-default-background: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-foreground) 6%);
				--_tooltip-default-tip-size: 1rem;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-popover mode='hint'
				?open=${bind(this, 'open')}
				.anchor=${this.anchor}
				placement=${ifDefined(this.placement)}
				alignment='center'
				.cssRoot=${this}
			>
				<slot @slotchange=${this.handleSlotChange}></slot>
			</mo-popover>
		`
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