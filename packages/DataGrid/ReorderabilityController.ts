import { Controller, type ReactiveElement } from '@a11d/lit'
import Sortable from 'sortablejs'

export class ReorderabilityController extends Controller {
	private initialized = false
	private before?: ChildNode
	private instance?: Sortable

	constructor(
		override readonly host: ReactiveElement & HTMLElement,
		readonly options?: Partial<Sortable.Options> & { readonly element?: () => HTMLElement },
	) { super(host) }

	override hostUpdated() {
		if (this.initialized) {
			return
		}

		const element = this.options?.element?.() ?? this.host
		this.instance = Sortable.create(element, {
			...this.options,
			onStart: e => {
				this.before = e.item.previousSibling ?? undefined,
				this.options?.onStart?.(e)
			},
			onEnd: e => {
				// put the item back
				this.before?.after(e.item)
				this.options?.onEnd?.(e)
			},
		})
	}
}