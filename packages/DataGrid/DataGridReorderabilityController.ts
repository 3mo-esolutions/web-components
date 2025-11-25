import { AsyncDirective, Controller, directive, noChange, PartType, type ElementPart, type PartInfo, type ReactiveElement } from '@a11d/lit'
import type { DataGrid } from './DataGrid.js'
import type { DataRecord } from './DataRecord.js'
import { DataGridSelectability } from './DataGridSelectionController.js'

class DragGhostImage extends Image {
	static readonly instance = new DragGhostImage()
	override src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=='
}

export enum ReorderabilityState {
	Idle = 'idle',
	Dragging = 'dragging',
	DropBefore = 'drop-before',
	DropAfter = 'drop-after',
}

type ReorderabilityControllerItemDirectiveOptions = {
	readonly index: number
	readonly disabled?: boolean
}

export class ReorderabilityController extends Controller {
	constructor(override readonly host: ReactiveElement, readonly options: {
		handleReorder?: (source: number, destination: number) => void
	}) { super(host) }

	private readonly items = new Map<HTMLElement, ReorderabilityControllerItemDirectiveOptions>()
	private draggingItem?: { source: number, destination: number }

	get item() {
		const controller = this
		return directive(class extends AsyncDirective {
			host?: HTMLElement
			container?: HTMLElement
			part?: ElementPart
			options?: ReorderabilityControllerItemDirectiveOptions

			constructor(partInfo: PartInfo) {
				super(partInfo)

				if (partInfo.type !== PartType.ELEMENT) {
					throw new Error('This directive can only be used on an element')
				}
			}

			override render(options: ReorderabilityControllerItemDirectiveOptions) {
				options
				return noChange
			}

			override update(part: ElementPart, [options]: [ReorderabilityControllerItemDirectiveOptions]) {
				this.part = part
				this.options = options
				const element = part.element as HTMLElement
				controller.items.set(element, options)
				element.draggable = !options.disabled
				element.dataset.reorderability = this.state
				this.addEventListeners()
				return noChange
			}

			get state() {
				const draggingItem = controller.draggingItem
				switch (true) {
					case draggingItem === undefined:
						return ReorderabilityState.Idle
					case draggingItem!.source === this.options!.index:
						return ReorderabilityState.Dragging
					case draggingItem!.destination !== this.options!.index:
						return ReorderabilityState.Idle
					case draggingItem!.source > this.options!.index:
						return ReorderabilityState.DropBefore
					default:
						return ReorderabilityState.DropAfter
				}
			}

			override disconnected() {
				controller.items.delete(this.part!.element as HTMLElement)
				this.removeEventListeners()
			}

			override reconnected() {
				this.addEventListeners()
			}

			addEventListeners() {
				if (!this.part) return
				const element = this.part.element as HTMLElement
				element.addEventListener('dragstart', controller, { capture: true })
				element.addEventListener('dragover', controller, { capture: true })
				element.addEventListener('drop', controller, { capture: true })
				element.addEventListener('dragend', controller, { capture: true })
			}

			removeEventListeners() {
				if (!this.part) return
				const element = this.part.element as HTMLElement
				element.removeEventListener('dragstart', controller)
				element.removeEventListener('dragover', controller)
				element.removeEventListener('drop', controller)
				element.removeEventListener('dragend', controller)
			}
		})
	}

	handleEvent(e: DragEvent) {
		if (this.items.get(e.currentTarget as HTMLElement)?.disabled) {
			return
		}
		switch (e.type) {
			case 'dragstart':
				return this.handleDragStart(e)
			case 'dragover':
				return this.handleDropOver(e)
			case 'drop':
				return this.handleDrop(e)
			case 'dragend':
				return this.handleDragEnd(e)
		}
	}

	private handleDragStart(e: DragEvent) {
		const index = this.items.get(e.currentTarget as HTMLElement)!.index

		this.draggingItem = { source: index, destination: index }

		e.dataTransfer?.setDragImage(DragGhostImage.instance, 0, 0)
		e.dataTransfer!.effectAllowed = 'move'
		this.host.requestUpdate()
	}

	private handleDropOver(e: DragEvent) {
		if (this.draggingItem) {
			e.preventDefault()
			e.dataTransfer!.dropEffect = 'move'
			this.draggingItem.destination = this.items.get(e.currentTarget as HTMLElement)!.index
			this.host.requestUpdate()
		}
	}

	private handleDrop(e: DragEvent) {
		e.preventDefault()

		if (!this.draggingItem) {
			return
		}

		this.handleReorder(this.draggingItem.source, this.draggingItem.destination)

		this.draggingItem = undefined
		this.host.requestUpdate()
	}

	private handleDragEnd(e: DragEvent) {
		e
		this.draggingItem = undefined
		this.host.requestUpdate()
	}

	protected handleReorder(source: number, destination: number) {
		this.options.handleReorder?.(source, destination)
	}
}

export type DataGridReorder<T> = Array<{
	readonly record: DataRecord<T>
	readonly oldIndex: number
	readonly type: 'move' | 'shift'
}>

export class DataGridReorderabilityController<T> extends ReorderabilityController {
	constructor(override readonly host: DataGrid<T>) {
		super(host, {})
	}

	get enabled() {
		return this.host.reorderability
			&& this.host.sortingController.enabled === false
			&& this.host.selectionController.selectability !== DataGridSelectability.Multiple
			&& this.host.detailsController.hasDetails === false
	}

	reorder(source: number, destination: number) {
		this.handleReorder(source, destination)
	}

	protected override handleReorder(source: number, destination: number) {
		const d = [...this.host.data]
		const [movedItem] = d.splice(source, 1)
		d.splice(destination, 0, movedItem!)
		this.host.data = d
	}
}