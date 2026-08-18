import { Controller, eventListener, type ReactiveElement } from '@a11d/lit'
import { calculateSnackbarStackLayout, type SnackbarStackItemLayout } from './SnackbarStackLayout.js'

/** What the stack needs of a snack-bar. */
export interface SnackbarStackHost extends ReactiveElement {
	/** Whether the snack-bar currently takes part in the stack. */
	readonly open: boolean
	/** The element the layout is applied to. */
	readonly surface: HTMLElement | null
	/** Dismisses the snack-bar. Called when it is pushed past {@link SnackbarStackController.maxCount}. */
	close(): void
	/** Called whenever the stack expands or collapses, so that the snack-bar can hold its timer while it is being read. */
	handleStackExpandedChange?(expanded: boolean): void
}

/**
 * Lays every open snack-bar out relative to the others, as they all sit on the same anchored edge and
 * only know of themselves.
 *
 * One controller belongs to one snack-bar, but the state that matters is shared by all of them: a
 * snack-bar's position depends on how many others are open and on whether any of them is being read.
 * The controllers therefore keep a single registry, in connection order, and the newest snack-bar takes
 * the front of the stack. {@link calculateSnackbarStackLayout} works out where each one goes; this
 * controller measures, applies and schedules.
 */
export class SnackbarStackController extends Controller {
	/** How many snack-bars are laid out in full before the rest collapse behind the last of them. */
	static expandedCount = 3
	/** How many collapsed snack-bars peek out behind the stack's base before the rest are hidden. */
	static peekCount = 2
	/** How many snack-bars may be open at once before the oldest ones are dismissed. */
	static maxCount = 7
	static gap = 8
	static peekHeight = 12
	static peekScale = 0.05
	/** How long the stack stays expanded after it is left, so that moving between snack-bars does not collapse it. */
	static collapseDelay = 300

	private static readonly controllers = new Set<SnackbarStackController>()
	private static readonly hoveredControllers = new Set<SnackbarStackController>()
	private static readonly focusedControllers = new Set<SnackbarStackController>()

	/** The open snack-bars, front-most — the newest — first. */
	private static get stackedControllers() {
		return [...SnackbarStackController.controllers]
			.filter(controller => controller.host.open && !!controller.host.surface)
			.reverse()
	}

	private static _expanded = false
	/** Whether every snack-bar is currently laid out in full because the stack is being read. */
	static get expanded() { return SnackbarStackController._expanded }

	private static collapseTimerId?: number

	private static requestExpansionUpdate() {
		window.clearTimeout(SnackbarStackController.collapseTimerId)
		const expanded = SnackbarStackController.hoveredControllers.size > 0 || SnackbarStackController.focusedControllers.size > 0
		const apply = () => {
			if (SnackbarStackController._expanded !== expanded) {
				SnackbarStackController._expanded = expanded
				for (const controller of SnackbarStackController.stackedControllers) {
					controller.host.handleStackExpandedChange?.(expanded)
				}
				SnackbarStackController.requestLayoutUpdate()
			}
		}
		if (expanded) {
			apply()
		} else {
			SnackbarStackController.collapseTimerId = window.setTimeout(apply, SnackbarStackController.collapseDelay)
		}
	}

	private static layoutUpdateRequested = false

	/** Coalesces the layout passes of all snack-bars that change within the same frame into one. */
	static requestLayoutUpdate() {
		if (SnackbarStackController.layoutUpdateRequested === false) {
			SnackbarStackController.layoutUpdateRequested = true
			const update = () => {
				if (SnackbarStackController.layoutUpdateRequested) {
					SnackbarStackController.layoutUpdateRequested = false
					SnackbarStackController.updateLayout()
				}
			}
			requestAnimationFrame(update)
			// Animation frames do not run in a hidden document, where a snack-bar would otherwise never be laid out and so never be seen
			window.setTimeout(update, 100)
		}
	}

	private static updateLayout() {
		const controllers = SnackbarStackController.stackedControllers

		for (const overflowing of controllers.slice(SnackbarStackController.maxCount)) {
			overflowing.host.close()
		}

		const laidOut = controllers.slice(0, SnackbarStackController.maxCount)
		// Unclamped before measuring, as a collapsed snack-bar is sized after the stack's base rather than its own content
		for (const controller of laidOut) {
			controller.clampSize(undefined)
		}
		const sizes = laidOut.map(controller => ({
			width: controller.host.surface!.offsetWidth,
			height: controller.host.surface!.offsetHeight,
		}))

		const layouts = calculateSnackbarStackLayout(sizes, {
			expandedCount: SnackbarStackController.expandedCount,
			peekCount: SnackbarStackController.peekCount,
			gap: SnackbarStackController.gap,
			peekHeight: SnackbarStackController.peekHeight,
			peekScale: SnackbarStackController.peekScale,
			expanded: SnackbarStackController.expanded,
		})

		for (const [index, controller] of laidOut.entries()) {
			controller.apply(layouts[index]!)
		}
	}

	constructor(protected override readonly host: SnackbarStackHost) {
		super(host)
	}

	override hostConnected() {
		SnackbarStackController.controllers.add(this)
		SnackbarStackController.requestLayoutUpdate()
	}

	override hostDisconnected() {
		SnackbarStackController.controllers.delete(this)
		SnackbarStackController.hoveredControllers.delete(this)
		SnackbarStackController.focusedControllers.delete(this)
		SnackbarStackController.requestExpansionUpdate()
		SnackbarStackController.requestLayoutUpdate()
	}

	/** Whether every snack-bar is currently laid out in full because the stack is being read. */
	get expanded() { return SnackbarStackController.expanded }

	requestLayoutUpdate() {
		SnackbarStackController.requestLayoutUpdate()
	}

	@eventListener('pointerenter')
	protected handlePointerEnter() {
		if (this.host.open) {
			SnackbarStackController.hoveredControllers.add(this)
			SnackbarStackController.requestExpansionUpdate()
		}
	}

	@eventListener('pointerleave')
	protected handlePointerLeave() {
		SnackbarStackController.hoveredControllers.delete(this)
		SnackbarStackController.requestExpansionUpdate()
	}

	@eventListener('focusin')
	protected handleFocusIn() {
		if (this.host.open) {
			SnackbarStackController.focusedControllers.add(this)
			SnackbarStackController.requestExpansionUpdate()
		}
	}

	@eventListener('focusout')
	protected handleFocusOut() {
		SnackbarStackController.focusedControllers.delete(this)
		SnackbarStackController.requestExpansionUpdate()
	}

	@eventListener({ target: window, type: 'resize' })
	protected handleWindowResize() {
		if (this.host.open) {
			SnackbarStackController.requestLayoutUpdate()
		}
	}

	private clampSize(size: SnackbarStackItemLayout['size']) {
		const surface = this.host.surface
		if (surface) {
			surface.style.width = !size ? '' : `${size.width}px`
			surface.style.height = !size ? '' : `${size.height}px`
		}
	}

	private apply(layout: SnackbarStackItemLayout) {
		const surface = this.host.surface
		if (!surface) {
			return
		}
		this.clampSize(layout.size)
		surface.style.setProperty('--mo-snackbar-y', `${layout.y}px`)
		surface.style.setProperty('--mo-snackbar-scale', `${layout.scale}`)
		surface.style.setProperty('--mo-snackbar-opacity', layout.hidden ? '0' : '1')
		surface.style.pointerEvents = layout.hidden ? 'none' : ''
		// A collapsed snack-bar is clamped to a size that is not its own, so its content is faded out rather than squeezed
		surface.toggleAttribute('data-collapsed', !!layout.size)
	}
}