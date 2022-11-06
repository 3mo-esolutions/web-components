import { directive, Directive, ElementPart, PartInfo, PartType } from '@a11d/lit'

export const observeResize = directive(class extends Directive {
	readonly observer = new ResizeObserver((...args) => this.callback?.(...args))
	readonly element: Element
	callback?: ResizeObserverCallback

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('observeResize can only be used on an element')
		}

		const part = partInfo as ElementPart
		this.element = part.element
	}

	render(callback: ResizeObserverCallback, options?: ResizeObserverOptions) {
		this.callback = callback
		this.observer.observe(this.element, options)
	}
})