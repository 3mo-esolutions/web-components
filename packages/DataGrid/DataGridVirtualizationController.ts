import { Controller, ElementRef, type DirectiveResult, type ReactiveControllerHost, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController, type IndexabilityItemOptions } from '@3mo/indexability'

/** All this controller needs of a row: to be re-rendered, and to know its place in the owner's data. */
export interface VirtualizableRow extends ReactiveControllerHost {
	/** Its position in the owner's data, which is the order the registry reports its parts in. */
	readonly index: number
}

interface VirtualizableRowOptions extends IndexabilityItemOptions {
	readonly row: VirtualizableRow
}

/**
 * Which rows render their cells. Every row stays in the DOM — consumers, tests and the keyboard
 * cursor may rely on that — while a row far enough from the root's viewport renders none of its
 * cells, and the part that would hold them keeps their height instead, so that nothing below it
 * moves and the scroll height stands still. It renders within {@link margin} of the viewport and is
 * emptied only {@link hysteresis} further out again.
 *
 * The owner declares the two parts of the anatomy and tells the controller when its rows change:
 *
 * ```ts
 * readonly virtualization = new DataGridVirtualizationController(this)
 *
 * protected override get template() {
 *   return html`<mo-scroller ${this.virtualization.root.ref()}>${this.rowsTemplate}</mo-scroller>`
 * }
 * ```
 *
 * A row asks whether to render its cells, and declares the part which holds them:
 *
 * ```ts
 * protected override get template() {
 *   const isRendered = this.owner.virtualization.isRendered(this)
 *   return html`
 *     <div ${this.owner.virtualization.cells(this)}>
 *       ${!isRendered ? html.nothing : this.cellsTemplate}
 *     </div>
 *   `
 * }
 * ```
 *
 * The height a part held while it was rendered is reported back onto it as `--_strip-height`, which
 * the part's own stylesheet is expected to take as its minimum size. What a row renders while it
 * holds no cells stays the row's business: only the row knows a cell from a detail, and that a part
 * which aligns nothing must not subgrid the owner's tracks.
 */
export class DataGridVirtualizationController extends Controller {
	/** How far beyond the root's viewport a row renders, in pixels. */
	static margin = 800
	/**
	 * How much further than {@link margin} a row is carried before it is emptied, in pixels. Rendering
	 * a row costs far more than keeping one, so the band a row is emptied outside of is wider than the
	 * one it renders inside of, and scrolling back over a row does not rebuild what was just emptied.
	 */
	static hysteresis = 400
	/** How many rows render before the root and the rows have been measured. @see eagerAllowance */
	static eagerRenders = 50

	readonly indexability: IndexabilityController<unknown, VirtualizableRowOptions>

	private readonly parts = new Set<Element>()
	private readonly observedParts = new Set<Element>()
	private readonly renderedRows = new WeakSet<VirtualizableRow>()
	private readonly decidedRows = new WeakSet<VirtualizableRow>()
	private rootElement?: Element
	private observer?: IntersectionObserver
	private retentionObserver?: IntersectionObserver
	private rootResizeObserver?: ResizeObserver
	private rootHeight = 0
	private partHeight = 0
	private remainingEagerRenders = DataGridVirtualizationController.eagerRenders

	constructor(override readonly host: ReactiveElement) {
		super(host)
		this.indexability = new IndexabilityController(host)
		this.indexability.observe({
			handleItemUpdated: item => this.add(item.element),
			handleItemRemoved: element => this.remove(element),
		})
	}

	/**
	 * Whether a row shall render its cells. A row this controller has not decided about yet renders
	 * as long as the eager allowance lasts, which is how the first screenful paints before the
	 * observer has reported about anything — it only reports after the first paint.
	 */
	isRendered(row: VirtualizableRow) {
		if (!this.decidedRows.has(row)) {
			this.decidedRows.add(row)
			if (this.remainingEagerRenders > 0) {
				this.remainingEagerRenders -= 1
				this.renderedRows.add(row)
			}
		}
		return this.renderedRows.has(row)
	}

	reveal(row: VirtualizableRow) {
		return this.decide(row, true)
	}

	hide(row: VirtualizableRow) {
		return this.decide(row, false)
	}

	handleItemsChange() {
		this.remainingEagerRenders = this.eagerAllowance
	}

	/**
	 * How many rows shall render before the observer has reported: as many as fit the root and the
	 * margin below it, measured rather than assumed, since a row is as tall as whoever renders it
	 * makes it. Only the margin below, as nothing has been scrolled past yet when a set of rows first
	 * renders. @see DataGridVirtualizationController.eagerRenders until both are known.
	 */
	private get eagerAllowance() {
		return !this.rootHeight || !this.partHeight
			? DataGridVirtualizationController.eagerRenders
			: Math.ceil((this.rootHeight + DataGridVirtualizationController.margin) / this.partHeight)
	}

	override hostDisconnected() {
		this.setRoot(undefined)
	}

	/** The root the parts are measured against. */
	readonly root = new ElementRef<Element>({
		updated: element => this.setRoot(element),
		disconnected: () => this.setRoot(undefined),
	})

	private _cells?: (row: VirtualizableRow) => DirectiveResult
	get cells() {
		const item = this.indexability.item
		return this._cells ??= (row: VirtualizableRow) => item({ index: row.index, row })
	}

	private decide(row: VirtualizableRow, isRendered: boolean) {
		this.decidedRows.add(row)
		if (isRendered) {
			this.renderedRows.add(row)
		} else {
			this.renderedRows.delete(row)
		}
		row.requestUpdate()
		return row.updateComplete
	}

	private setRoot(root: Element | undefined) {
		if (root === this.rootElement) {
			return
		}
		this.rootElement = root
		this.observer?.disconnect()
		this.observer = undefined
		this.retentionObserver?.disconnect()
		this.retentionObserver = undefined
		this.observedParts.clear()
		this.rootResizeObserver?.disconnect()
		this.rootResizeObserver = undefined

		if (!root) {
			return
		}

		// The parts are observed only once the root has a box of its own. An observer whose root has
		// none reports every part as hidden, once and never again — leaving the rows as they were,
		// which is how a row rendered by the eager allowance would stay rendered for good.
		this.rootResizeObserver = new ResizeObserver(entries => {
			const height = entries.at(-1)?.contentRect.height ?? 0
			if (height > 0) {
				// Kept while the root is hidden and reports none, as it is the height it will have again.
				this.rootHeight = height
				this.observeParts()
			}
		})
		this.rootResizeObserver.observe(root)
	}

	private observeParts() {
		const root = this.rootElement
		if (!root) {
			return
		}
		const { margin, hysteresis } = DataGridVirtualizationController
		// One observer per edge of the hysteresis: the narrow band says what to render, the wide one
		// what to empty, and a part between them is left alone.
		this.observer ??= new IntersectionObserver(entries => this.handleIntersections(entries, true), {
			root,
			rootMargin: `${margin}px 0px`,
		})
		this.retentionObserver ??= new IntersectionObserver(entries => this.handleIntersections(entries, false), {
			root,
			rootMargin: `${margin + hysteresis}px 0px`,
		})
		for (const part of this.parts) {
			this.observe(part)
		}
	}

	private add(part: Element) {
		this.parts.add(part)
		this.observe(part)
	}

	private observe(part: Element) {
		if (this.observer && this.retentionObserver && !this.observedParts.has(part)) {
			this.observedParts.add(part)
			this.observer.observe(part)
			this.retentionObserver.observe(part)
		}
	}

	private remove(part: Element) {
		this.parts.delete(part)
		this.observedParts.delete(part)
		this.observer?.unobserve(part)
		this.retentionObserver?.unobserve(part)
	}

	private handleIntersections(entries: ReadonlyArray<IntersectionObserverEntry>, isRenderBand: boolean) {
		let smallestPart = 0
		for (const { target, isIntersecting, rootBounds, boundingClientRect } of entries) {
			// A root momentarily without a box — a resize, a zoom — reports every part as hidden. The
			// rows are left as they are, and the report that follows the resize decides about them.
			if (!rootBounds || (rootBounds.width === 0 && rootBounds.height === 0)) {
				continue
			}
			// The smallest of them, as that is the one which makes the most rows fit the root.
			if (boundingClientRect.height > 0) {
				smallestPart = !smallestPart ? boundingClientRect.height : Math.min(smallestPart, boundingClientRect.height)
			}
			// Each band answers one question only: entering the narrow one renders, leaving the wide
			// one empties, and everything else is the other band's business.
			if (isIntersecting !== isRenderBand) {
				continue
			}
			const row = this.indexability.itemAt([target])?.options.row
			if (!row) {
				continue
			}
			if (this.renderedRows.has(row) === isIntersecting) {
				this.decidedRows.add(row)
				continue
			}
			const part = target as HTMLElement
			if (isIntersecting) {
				part.style.removeProperty('--_strip-height')
			} else if (boundingClientRect.height > 0) {
				// Measured while the cells are still rendered, so that emptying the part does not resize the row.
				part.style.setProperty('--_strip-height', `${boundingClientRect.height}px`)
			}
			this.decide(row, isIntersecting)
		}
		if (smallestPart) {
			this.partHeight = smallestPart
		}
	}
}