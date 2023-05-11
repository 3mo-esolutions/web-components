import { directive, Directive, PartType, PartInfo, html, ChildPart, DirectiveParameters, HTMLTemplateResult } from '@a11d/lit'

type SortedCallback<T> = (data: Array<T>) => void

type SortableDirectiveParameters<T> = {
	data: Array<T>
	sortedCallback: SortedCallback<T>
	getItemTemplate: (item: T) => HTMLTemplateResult
	getDragImage?: (item: HTMLElement) => HTMLElement
}

class SortableDirective<T> extends Directive {
	private static readonly nonSortableAttributeName = 'data-non-sortable'
	private static readonly dropIndicationTransitionInPx = 10

	private readonly element: HTMLElement
	private parameters!: SortableDirectiveParameters<T>
	private sortedData = new Array<T>()
	private drag?: {
		readonly element: HTMLElement
		readonly elementRect: DOMRectReadOnly
		readonly elementRects: Array<DOMRectReadOnly>
	}

	private get elements() {
		return Array.from(this.element.children)
			.filter(element => element instanceof HTMLElement && element.hasAttribute(SortableDirective.nonSortableAttributeName) === false) as Array<HTMLElement>
	}

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type !== PartType.CHILD) {
			throw new Error('SortableDirective can only be used as a child directive')
		}
		// @ts-expect-error Element exists but not typed by lit
		this.element = partInfo.parentNode
		this.element.ondragover = (event: DragEvent) => event.preventDefault()
		Array.from(this.element.children).forEach(element => element.setAttribute(SortableDirective.nonSortableAttributeName, ''))
	}

	render(parameters: SortableDirectiveParameters<T>) {
		this.parameters = parameters
		return html`${this.parameters.data.map(parameters.getItemTemplate)}`
	}

	override update(part: ChildPart, parameters: DirectiveParameters<this>) {
		for (const element of this.elements) {
			this.registerEvents(element)
		}
		return super.update(part, parameters)
	}

	private registerEvents(child: HTMLElement) {
		child.draggable = true
		child.style.transition = '0.25s'

		child.ondragleave = e => e.preventDefault()

		child.ondragstart = e => {
			const element = e.target as HTMLElement

			if (this.parameters.getDragImage) {
				e.dataTransfer?.setDragImage(this.parameters.getDragImage(element), 1000, 1000)
			}

			this.drag = {
				element: element,
				elementRect: element.getBoundingClientRect(),
				elementRects: this.elements.map(element => element.getBoundingClientRect()),
			}
			this.elements
				.filter(element => element !== this.drag?.element)
				.forEach(element => element.style.opacity = '0.5')
		}
		child.ondragend = e => {
			e.preventDefault()
			this.drag = undefined
			this.elements.forEach(element => {
				element.style.opacity = '1'
				element.style.transform = 'unset'
			})
			this.parameters.sortedCallback(this.sortedData)
		}

		child.ondrag = e => {
			if (this.drag) {
				const fromIndex = this.elements.indexOf(this.drag.element)
				const toIndex = this.getElementIndexToMoveTo(e)
				const elements = this.elements
				const isLeftInteraction = this.isLeftInteraction(e)
				const preToElement = isLeftInteraction ? elements[toIndex - 1] : elements[toIndex] as HTMLElement | null ?? null
				const toElement = isLeftInteraction ? elements[toIndex] : elements[toIndex + 1] as HTMLElement | null ?? null
				for (const element of this.elements) {
					if ([preToElement, toElement].includes(this.drag.element) || [preToElement, toElement].includes(element) === false) {
						element.style.transform = 'unset'
					} else if (element === preToElement) {
						const factor = !toElement ? 2 : 1
						preToElement.style.transform = `translateX(-${SortableDirective.dropIndicationTransitionInPx * factor}px)`
					} else if (element === toElement) {
						const factor = !preToElement ? 2 : 1
						toElement.style.transform = `translateX(${SortableDirective.dropIndicationTransitionInPx * factor}px)`
					}
				}
				this.sortedData = this.moveData(fromIndex, toIndex)
			}
		}
	}

	private moveData(fromIndex: number, toIndex: number) {
		const clone = [...this.parameters.data]
		const element = clone.splice(fromIndex, 1)[0]
		clone.splice(toIndex, 0, element!)
		return clone
	}

	private getElementIndexToMoveTo(e: DragEvent) {
		const firstElementX = this.elements[0]!.getBoundingClientRect().left
		if (e.clientX < firstElementX) {
			return 0
		}

		const lastElementX = this.elements[this.elements.length - 1]!.getBoundingClientRect().left
		if (e.clientX > lastElementX) {
			return this.elements.length - 1
		}

		const isLeftInteraction = this.isLeftInteraction(e)
		const index = this.drag?.elementRects.findIndex((rect, index, rects) => {
			const leftGap = index === 0 ? 0 : rect.left - rects[index - 1]!.left - rects[index - 1]!.width
			const rightGap = index === rects.length - 1 ? 0 : rects[index + 1]!.left - rect.left - rect.width
			return isLeftInteraction
				? e.clientX >= rect.left - rect.width / 2 - leftGap && e.clientX <= rect.left + rect.width / 2
				: e.clientX >= rect.right - rect.width / 2 && e.clientX <= rect.right + rect.width / 2 + rightGap
		}) ?? -1

		return Math.max(0, Math.min(
			index,
			this.elements.length - 1
		))
	}

	private isLeftInteraction(e: DragEvent) {
		return e.clientX < (this.drag?.elementRect.left ?? 0) + (this.drag?.elementRect.width ?? 0) / 2
	}
}

// @ts-expect-error T cannot be inferred
export const sortable = <T>(parameters: SortableDirectiveParameters<T>) => directive(SortableDirective)(parameters)