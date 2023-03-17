import { AsyncDirective, directive, type ElementPart, type PartInfo, PartType } from '@a11d/lit'

class IntersectionDirective extends AsyncDirective {
	observer?: IntersectionObserver
	protected readonly element: Element
	protected callback?: IntersectionObserverCallback

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('observeIntersection can only be used on an element')
		}

		const part = partInfo as ElementPart
		this.element = part.element
	}

	render(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
		this.callback = callback
		this.observer ??= new IntersectionObserver(callback, options)
		this.observer.observe(this.element)
	}

	protected override disconnected() {
		this.observer?.disconnect()
	}
}

export const observeIntersection = directive(IntersectionDirective)