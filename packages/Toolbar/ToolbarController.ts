import { Controller, ElementRef, type ReactiveControllerHost } from '@a11d/lit'
import { OverflowController } from '@3mo/overflow-controller'
import { SlotController } from '@3mo/slot-controller'

/**
 * Moves the host's items between a pane slot and an overflow slot, so that items which do not fit
 * the pane render wherever the overflow slot is projected into - usually an overflow menu. Being
 * plain slot reassignments of one and the same element, the items keep their state and listeners.
 *
 * The measured pane is designated where it stands:
 *
 * ```html
 * <mo-toolbar-pane ${this.toolbarController.pane.ref()}>
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

	readonly pane = new ElementRef<Element>()

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
			get container() { return controller.pane.value },
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