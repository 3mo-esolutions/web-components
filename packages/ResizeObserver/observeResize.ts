import { AsyncDirective, directive, type ElementPart, type PartInfo, PartType } from '@a11d/lit'

class ResizeDirective extends AsyncDirective {
	readonly observer = new ResizeObserver((...args) => this.callback?.(...args))
	protected readonly element: Element
	protected callback?: ResizeObserverCallback
	protected onDisconnect?: () => void

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('observeResize can only be used on an element')
		}

		const part = partInfo as ElementPart
		this.element = part.element
	}

	render(callback: ResizeObserverCallback, options?: ResizeObserverOptions, onDisconnect?: () => void) {
		this.callback = callback
		this.onDisconnect = onDisconnect
		this.observer.observe(this.element, options)
	}

	protected override disconnected() {
		this.observer.disconnect()
		this.onDisconnect?.()
	}
}

export const observeResize = directive(ResizeDirective)