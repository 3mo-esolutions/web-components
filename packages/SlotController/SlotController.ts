import { Controller, isServer, type ReactiveControllerHost } from '@a11d/lit'

/**
 * A controller that re-renders its host when its slotted content changes and tells what each slot holds.
 * Before a slot is rendered it answers from the host's children, so a template can decide whether to render the slot at all.
 */
export class SlotController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost & Element & { readonly hydrating?: boolean }, private readonly slotChangeCallback?: () => void) {
		super(host)
		if (isServer === false) {
			new MutationObserver(this.handleMutation.bind(this)).observe(this.host, {
				childList: true,
				subtree: true,
			})
		}
	}

	getAssignedNodes(slotName: string) {
		if (isServer || this.host.hydrating) {
			return []
		}
		const slot = this.host.shadowRoot?.querySelector<HTMLSlotElement>(slotName ? `slot[name="${slotName}"]` : 'slot:not([name])')
		return slot
			? this.extractNodesFromSlot(slot)
			: this.extractNodesFromChildren(slotName)
	}

	hasAssignedNodes(slotName: string) {
		return this.getAssignedNodes(slotName).length > 0
	}

	/** Whether the slot holds an element or text that is not blank. */
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
		const nodes = new Array<Node>()
		for (let child = this.host.firstChild; child; child = child.nextSibling) {
			if (child instanceof Element) {
				if (child.slot !== slotName) {
					continue
				}
				if (child instanceof HTMLSlotElement) {
					nodes.push(...child.assignedNodes())
				} else {
					nodes.push(child)
				}
			} else if (!slotName && child instanceof Text && child.textContent?.trim()) {
				nodes.push(child)
			}
		}
		return nodes
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
