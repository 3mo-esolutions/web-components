import { AsyncDirective, directive, type ElementPart, type PartInfo, PartType } from '@a11d/lit'

class MutationDirective extends AsyncDirective {
	readonly observer = new MutationObserver((...args) => this.callback?.(...args))
	protected readonly element: Element
	protected callback?: MutationCallback

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('observeMutation can only be used on an element')
		}

		const part = partInfo as ElementPart
		this.element = part.element

		if (this.element instanceof HTMLSlotElement) {
			this.element.addEventListener('slotchange', () => this.callback?.([], this.observer))
		}
	}

	render(callback: MutationCallback, options: MutationObserverInit = { childList: true }) {
		this.callback = callback
		this.observer.observe(this.element, options)
	}

	protected override disconnected() {
		this.observer.disconnect()
	}
}

export const observeMutation = directive(MutationDirective)