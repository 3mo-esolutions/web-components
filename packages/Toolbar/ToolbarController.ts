import { type ElementPart, AsyncDirective, Controller, type ReactiveControllerHost, directive, html } from '@a11d/lit'
import { IntersectionController } from '@3mo/intersection-observer'
import { SlotController } from '@3mo/slot-controller'
import { type ToolbarPane } from './index.js'

const generatePaneDirective = (controller: ToolbarController) => directive(class ToolbarPaneDirective extends AsyncDirective {
	pane?: ToolbarPane

	override reconnected() { super.reconnected() }

	render() { return html.nothing }

	override async update(part: ElementPart) {
		this.pane = part.element as ToolbarPane
		controller.beginObserving(this.pane)
		this.pane.fillerResize.subscribe(this.handleResize)
		await this.pane.updateComplete
		this.pane.items.forEach(x => x.slot === controller.paneSlotName && !x.hasAttribute('data-no-overflow') && controller.intersectionController?.observe(x))
		this.pane.itemsChange.subscribe(this.handleItemsChange)
		return super.update(part, [])
	}

	override disconnected() {
		this.pane?.fillerResize.unsubscribe(this.handleResize)
		this.pane?.itemsChange.unsubscribe(this.handleItemsChange)
	}

	handleItemsChange = () => {
		this.pane?.items.forEach(x => x.slot === controller.paneSlotName && !x.hasAttribute('data-no-overflow') && controller.intersectionController?.observe(x))
	}

	handleResize = () => {
		for (const target of controller.slotController?.getAssignedElements(controller.overflowContentSlotName) ?? []) {
			target.slot = controller.paneSlotName
		}
	}
})

export class ToolbarController extends Controller {
	readonly slotController = this.host.slotController ?? new SlotController(this.host)

	protected _intersectionController?: IntersectionController
	get intersectionController() { return this._intersectionController }

	beginObserving(root: ToolbarPane) {
		this._intersectionController = new IntersectionController(root, {
			target: null,
			config: { threshold: .99, root },
			callback: entries => {
				let changed = false
				for (const entry of entries) {
					const target = entry.target
					if (!entry.isIntersecting) {
						target.slot = this.overflowContentSlotName
						this.intersectionController?.unobserve(target)
						changed = true
					}
				}
				if (changed) {
					root.requestUpdate()
				}
			}
		})
	}

	get paneSlotName() { return this.options?.paneSlotName ?? '' }
	get overflowContentSlotName() { return this.options?.overflowContentSlotName ?? 'overflow-content' }

	readonly pane = generatePaneDirective(this)

	constructor(
		protected override readonly host: ReactiveControllerHost & Element & { readonly slotController?: SlotController },
		readonly options?: {
			readonly paneSlotName: string
			readonly overflowContentSlotName: string
		}
	) { super(host) }
}