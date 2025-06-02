import { AsyncDirective, directive, type ElementPart, type PartInfo, PartType } from '@a11d/lit'

class IntersectionDirective extends AsyncDirective {
	observer?: IntersectionObserver
	protected readonly element: Element
	protected callback!: IntersectionObserverCallback
	protected options?: IntersectionObserverInit

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
		this.options = options
		this.observe()
	}

	protected override disconnected() {
		this.unobserve()
	}

	protected override reconnected() {
		this.observe()
	}

	observe() {
		this.observer ??= new IntersectionObserver(this.callback, this.options)
		this.observer.observe(this.element)
	}

	unobserve() {
		this.observer?.disconnect()
		this.observer = undefined
	}
}

export const observeIntersection = directive(IntersectionDirective)