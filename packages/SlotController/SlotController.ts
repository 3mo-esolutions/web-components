import { Controller, ReactiveControllerHost } from '@a11d/lit'

export class SlotController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost & Element, private readonly slotChangeCallback?: () => void) {
		super(host)
	}

	getAssignedElements(slotName: string) {
		const slotElement = this.host.shadowRoot?.querySelector<HTMLSlotElement>(slotName ? `slot[name="${slotName}"]` : 'slot:not([name])')

		if (!slotElement) {
			return []
		}

		const extractElementFromSlot = (slot: HTMLSlotElement): Array<Element> => {
			return slot.assignedElements()
				.flatMap(e => e instanceof HTMLSlotElement ? extractElementFromSlot(e) : [e])
				.filter((e): e is Element => (e instanceof Element && e.slot === slotName) || ((e instanceof Element) === false && !slotName))
		}

		return extractElementFromSlot(slotElement)
	}

	hasAssignedElements(slotName: string) {
		return this.getAssignedElements(slotName).length > 0
	}

	override hostConnected() {
		this.host.shadowRoot?.addEventListener('slotchange', this.handleChange)
	}

	override hostDisconnected() {
		this.host.shadowRoot?.removeEventListener('slotchange', this.handleChange)
	}

	private readonly handleChange = () => {
		this.host.requestUpdate()
		this.slotChangeCallback?.()
	}
}