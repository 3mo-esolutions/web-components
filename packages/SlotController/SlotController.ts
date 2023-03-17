import { Controller, type ReactiveControllerHost } from '@a11d/lit'

export class SlotController extends Controller {
	protected readonly mutationObserver = new MutationObserver(this.handleMutation.bind(this)).observe(this.host, {
		childList: true,
		subtree: true,
	})

	constructor(protected override readonly host: ReactiveControllerHost & Element, private readonly slotChangeCallback?: () => void) {
		super(host)
	}

	getAssignedNodes(slotName: string) {
		const slot = this.host.shadowRoot?.querySelector<HTMLSlotElement>(slotName ? `slot[name="${slotName}"]` : 'slot:not([name])')
		return slot
			? this.extractNodesFromSlot(slot)
			: this.extractNodesFromChildren(slotName)
	}

	hasAssignedNodes(slotName: string) {
		return this.getAssignedNodes(slotName).length > 0
	}

	hasAssignedContent(slotName: string) {
		return this.getAssignedNodes(slotName)
			.some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() || node.nodeType === Node.ELEMENT_NODE)
	}

	getAssignedElements(slotName: string) {
		return this.getAssignedNodes(slotName).filter((node): node is Element => node instanceof Element)
	}

	hasAssignedElements(slotName: string) {
		return this.getAssignedElements(slotName).length > 0
	}

	private extractNodesFromSlot(slot: HTMLSlotElement): Array<Node> {
		return slot.assignedNodes().flatMap(e => e instanceof HTMLSlotElement ? this.extractNodesFromSlot(e) : [e])
	}

	private extractNodesFromChildren(slotName: string) {
		return [...this.host.childNodes]
			.filter(node => node instanceof Element || (node instanceof Text && !!node.textContent?.trim()))
			.filter(child => child instanceof Element ? child.slot === slotName : !slotName)
			.flatMap(child => child instanceof HTMLSlotElement ? child.assignedNodes() : [child])
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

	private handleMutation(mutations: MutationRecord[]) {
		if (mutations.some(mutation => mutation.type === 'childList')) {
			this.handleChange()
		}
	}
}