import { Controller, ReactiveControllerHost, html, ref } from '@a11d/lit'
import { IntersectionController } from '@3mo/intersection-observer'
import { SlotController } from '@3mo/slot-controller'
import { ToolbarPane } from './index.js'

export class ToolbarController extends Controller {
	protected pane?: ToolbarPane

	slotController?: SlotController
	protected intersectionController?: IntersectionController

	initiate = async (paneRef: Element | undefined) => {
		if (!(paneRef instanceof ToolbarPane)) {
			return
		}

		this.pane = paneRef
		this.pane.fillerResize.subscribe(this.handleResize)
		this.intersectionController = new IntersectionController(this.host, {
			target: null,
			config: { threshold: 1 },
			callback: entries => {
				for (const entry of entries) {
					const target = entry.target
					if (!entry.isIntersecting) {
						console.log(entry.intersectionRatio, target)
						target.slot = this.overflowSlot
						this.intersectionController?.unobserve(target)
					}
				}
				this.host.requestUpdate()
			}
		})

		this.slotController = (this.host as ReactiveControllerHost & Element & { slotController: SlotController }).slotController
			?? new SlotController(this.host)

		await this.pane.updateComplete
		this.pane.unfilteredItems.forEach(x => this.intersectionController?.observe(x))
		this.pane.itemsChange.subscribe(this.handleItemsChange)
	}

	override hostDisconnected(): void {
		this.pane?.fillerResize.unsubscribe(this.handleResize)
		this.pane?.itemsChange.unsubscribe(this.handleItemsChange)
	}

	protected handleItemsChange = (items: HTMLElement[]) => {
		items.forEach(x => this.intersectionController?.observe(x))
	}

	protected handleResize = () => {
		for (const target of this.slotController?.getAssignedElements(this.overflowSlot) ?? []) {
			target.slot = this.paneSlot
		}
	}

	constructor(protected override readonly host: ReactiveControllerHost & Element,
		readonly paneSlot = '',
		readonly overflowSlot = 'overflow') {
		super(host)
	}

	get paneTemplate() {
		return html`
			<mo-toolbar-pane ${ref(this.initiate)}>
				<slot name=${this.paneSlot}></slot>
			</mo-toolbar-pane>
		`
	}

	get overflowTemplate() {
		return html`
			<slot name=${this.overflowSlot}></slot>
		`
	}
}