import { AsyncDirective, directive, noChange, PartType, type DirectiveResult, type ElementPart, type PartInfo } from '@a11d/lit'

export interface PartDirective<T extends Element = HTMLElement> {
	(): DirectiveResult
	/** The element the directive is currently placed on, if any. */
	readonly element: T | undefined
}

export type PartOptions = {
	/** Listeners which follow the element the part designates, attached while it is connected. */
	readonly listeners?: Record<string, EventListener>
}

/**
 * Associates an element with a controller part via template directive (e.g. `<button ${controller.handle()}>`),
 * exposing it via `element` without queries or IDs.
 */
export function part<T extends Element = HTMLElement>(options?: PartOptions): PartDirective<T> {
	let current: T | undefined

	const listen = (element: T, method: 'addEventListener' | 'removeEventListener') => {
		for (const [type, listener] of Object.entries(options?.listeners ?? {})) {
			element[method](type, listener)
		}
	}

	const result = directive(class extends AsyncDirective {
		element?: T

		constructor(partInfo: PartInfo) {
			super(partInfo)
			if (partInfo.type !== PartType.ELEMENT) {
				throw new Error('A part directive can only be placed on an element')
			}
		}

		override render() {
			return noChange
		}

		override update(elementPart: ElementPart) {
			if (this.element !== elementPart.element) {
				this.element = elementPart.element as T
				this.attach()
			}
			return noChange
		}

		override disconnected() {
			this.detach()
		}

		override reconnected() {
			this.attach()
		}

		attach() {
			if (this.element) {
				current = this.element
				listen(this.element, 'addEventListener')
			}
		}

		detach() {
			if (this.element) {
				listen(this.element, 'removeEventListener')
				if (current === this.element) {
					current = undefined
				}
			}
		}
	})

	return Object.defineProperty(() => result(), 'element', { get: () => current }) as PartDirective<T>
}