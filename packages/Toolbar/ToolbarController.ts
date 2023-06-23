import { Controller, ReactiveControllerHost, html, ref } from '@a11d/lit'
import { IntersectionController } from '@3mo/intersection-observer'
import { SlotController } from '@3mo/slot-controller'
import { ToolbarPane } from './index.js'

export class ToolbarController extends Controller {
	protected pane?: ToolbarPane

	slotController?: SlotController
	protected overflowController?: IntersectionController

	protected initiateObservers = async (paneRef: Element | undefined) => {
		if (!(paneRef instanceof ToolbarPane)) {
			return
		}

		this.pane = paneRef
		this.overflowController = new IntersectionController(this.host, {
			target: null,
			config: { threshold: 1 },
			callback: entries => {
				for (const entry of entries) {
					const target = entry.target
					if (!entry.isIntersecting) {
						target.slot = this.overflowSlot
						this.overflowController?.unobserve(target)
					}
				}
				this.host.requestUpdate()
			}
		})

		this.slotController = (this.host as ReactiveControllerHost & Element & { slotController: SlotController }).slotController
			?? new SlotController(this.host)

		await this.pane.updateComplete
		this.pane.unfilteredItems.forEach(x => this.overflowController?.observe(x))
		this.pane.itemsChange.subscribe(elems => elems.forEach(x => this.overflowController?.observe(x)))
	}

	protected handleResize = () => {
		for (const target of this.slotController?.getAssignedElements('overflow') ?? []) {
			target.slot = this.paneSlot
		}
	}

	constructor(protected override readonly host: ReactiveControllerHost & Element, readonly paneSlot = '', readonly overflowSlot = 'overflow') {
		super(host)
	}

	get paneTemplate() {
		return html`
			<mo-toolbar-pane @fillerResize=${this.handleResize} ${ref(this.initiateObservers)}>
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