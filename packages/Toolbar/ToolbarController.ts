import { type ElementPart, AsyncDirective, Controller, type ReactiveControllerHost, directive, html } from '@a11d/lit'
import { OverflowController } from '@3mo/overflow-controller'
import { SlotController } from '@3mo/slot-controller'

const generatePaneDirective = (controller: ToolbarController) => directive(class ToolbarPaneDirective extends AsyncDirective {
	pane?: Element

	render() { return html.nothing }

	override update(part: ElementPart) {
		this.pane = part.element
		controller.paneElement = this.pane
		return super.update(part, [])
	}

	override disconnected() {
		if (controller.paneElement === this.pane) {
			controller.paneElement = undefined
		}
	}

	override reconnected() {
		controller.paneElement = this.pane
	}
})

/**
 * Moves the host's items between a pane slot and an overflow slot, so that items which do not fit
 * the pane render wherever the overflow slot is projected into - usually an overflow menu. Being
 * plain slot reassignments of one and the same element, the items keep their state and listeners.
 *
 * The measured pane is designated by rendering the @see pane directive on it:
 *
 * ```html
 * <mo-toolbar-pane ${this.toolbarController.pane()}>
 *     <slot name=${this.toolbarController.paneSlotName}></slot>
 * </mo-toolbar-pane>
 * ```
 *
 * Items opt out of overflowing via the `data-no-overflow` attribute.
 *
 * @ssr false
 */
export class ToolbarController extends Controller {
	readonly slotController = this.host.slotController ?? new SlotController(this.host)

	readonly overflowController: OverflowController<HTMLElement>

	paneElement?: Element

	readonly pane = generatePaneDirective(this)

	constructor(
		protected override readonly host: ReactiveControllerHost & Element & { readonly slotController?: SlotController },
		readonly options?: {
			readonly paneSlotName: string
			readonly overflowContentSlotName: string
		}
	) {
		super(host)
		const controller = this
		this.overflowController = new OverflowController<HTMLElement>(host, {
			get container() { return controller.paneElement },
			get items() {
				return [...controller.host.children].filter((child): child is HTMLElement =>
					child instanceof HTMLElement && (child.slot === controller.paneSlotName || child.slot === controller.overflowContentSlotName))
			},
			isPinned: item => item.hasAttribute('data-no-overflow'),
			handleChange: (item, overflows) => item.slot = overflows ? controller.overflowContentSlotName : controller.paneSlotName,
		})
	}

	get paneSlotName() { return this.options?.paneSlotName ?? '' }
	get overflowContentSlotName() { return this.options?.overflowContentSlotName ?? 'overflow-content' }
}