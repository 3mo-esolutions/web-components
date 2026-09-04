import { component, css, property, html, Component, state, bind, eventListener, ifDefined, event, type PropertyValues } from '@a11d/lit'
import { PopoverFloatingUiPositionController, PopoverInterestController } from '@3mo/popover'
import { type TooltipPlacement } from './TooltipPlacement.js'

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
	@property({ type: Object, updated(this: Tooltip) { this.interestController.resubscribe() } }) anchor?: HTMLElement

	@property({ type: Boolean, reflect: true }) rich = false

	@state() open = false

	protected readonly interestController = new PopoverInterestController(this, {
		anchor: () => this.anchor || [],
		handleChange: interested => this.setOpen(interested),
	})

	/**
	 * A tooltip is not a popover element itself, so the platform has no default action to run for it.
	 * Honoring the interest events nonetheless lets a native `interestfor` invoker drive the tooltip
	 * declaratively, in which case the invoker also becomes the element to tether to. The tooltip's
	 * own interest tracking naturally stands down, as it only ever tracks an assigned `anchor`,
	 * thereby leaving the gesture and timing semantics — including the `interest-delay`
	 * CSS properties — to the platform.
	 */
	@eventListener('interest')
	@eventListener('loseinterest')
	protected handleInterestChange(e: Event & { readonly source?: Element | null }) {
		if (e.source instanceof HTMLElement) {
			this.invoker = e.source
		}
		this.setOpen(e.type === 'interest')
	}

	@state() private invoker?: HTMLElement

	/** The element the tooltip is tethered to: its assigned anchor, or the native invoker showing interest. */
	get anchorElement() { return this.anchor ?? this.invoker }

	private setOpen(open: boolean) {
		if (this.open !== open) {
			this.open = open
			this.openChange.dispatch(open)
		}
	}

	protected override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.updateComplete.then(async () => {
			const popover = this.renderRoot.querySelector('mo-popover')
			if (popover?.positionController instanceof PopoverFloatingUiPositionController) {
				const { shift } = await import('@floating-ui/dom')
				popover.positionController.addMiddleware(shift({ crossAxis: true, padding: 4 }))
			}
		})
	}

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
				line-height: 1;

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

	// The popover's open state is driven entirely by the interest controller;
	// it must never self-open on anchor clicks or "Enter" key-downs.
	private readonly preventSelfOpen = () => false

	protected override get template() {
		return html`
			<mo-popover mode='hint'
				?open=${bind(this, 'open')}
				.anchor=${this.anchorElement}
				.shouldOpen=${this.preventSelfOpen}
				placement=${ifDefined(this.placement)}
				alignment='center'
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