import { Controller, ReactiveControllerHost, html, ref } from '@a11d/lit'
import { IntersectionController } from '@3mo/intersection-observer'
import { SlotController } from '@3mo/slot-controller'
import { observeResize } from '@3mo/resize-observer'
import { ToolbarPane } from './index.js'

export class ToolbarController extends Controller {
	protected pane?: ToolbarPane

	protected overflowController?: IntersectionController
	protected slotController?: SlotController

	protected lockReset = false

	protected initiateLos = async (paneRef: Element | undefined) => {
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
						console.log(entry.intersectionRatio.toFixed(2), target)
						this.lockReset = true
						target.slot = 'overflow'
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
	}

	protected handleResize = async () => {
		if (this.lockReset) {
			console.error('Reset Locked!')
			this.lockReset = false
			return
		}
		console.log('Resetting...')
		for (const target of this.slotController!.getAssignedElements('overflow')) {
			console.log('RESET', target)
			target.slot = ''
			this.overflowController?.observe(target)
		}
	}

	constructor(protected override readonly host: ReactiveControllerHost & Element) {
		super(host)
	}

	get paneTemplate() {
		return html`
			<mo-toolbar-pane ${observeResize(this.handleResize)} ${ref(this.initiateLos)} alignItems='center'>
				<slot></slot>
			</mo-toolbar-pane>
		`
	}

	get overflowTemplate() {
		return html`
			<slot name='overflow'></slot>
		`
	}
}