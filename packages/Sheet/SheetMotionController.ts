import { Controller, type ReactiveControllerHost } from '@a11d/lit'
import type { SheetPlacement } from './SheetPlacement.js'

export type SheetMotionControllerOptions = {
	readonly dialog: HTMLElement | undefined
	readonly panel: HTMLElement | undefined
	readonly placement: SheetPlacement
}

/**
 * Coordinates entry and exit motions for an edge-anchored sheet panel.
 * Sets `--mo-sheet-travel-size`, `--mo-sheet-motion-origin`, and `data-closing`
 * so CSS animations and gestures can smoothly animate from current positions.
 */
export class SheetMotionController extends Controller {
	private pinned = 0

	constructor(host: ReactiveControllerHost, protected readonly options: SheetMotionControllerOptions) {
		super(host)
	}

	get exiting() {
		return this.options.dialog?.hasAttribute('data-closing') ?? false
	}

	/** The panel's travel size along its anchored axis. */
	get travelSize() {
		const panel = this.options.panel
		if (!panel) {
			return 0
		}
		return this.options.placement.startsWith('inline') ? panel.offsetWidth : panel.offsetHeight
	}

	/** Prepares origin and travel size for entry animation after the surface is shown. */
	enter() {
		const { dialog, panel } = this.options
		if (!dialog || !panel) {
			return
		}
		// Preserve current translate if interrupting an in-flight exit.
		const origin = this.exiting ? this.currentTranslate : undefined
		dialog.toggleAttribute('data-closing', false)
		this.setOrigin(origin)
		this.pinTravelSize()
	}

	/** Plays the exit animation and resolves when completed. */
	async exit() {
		const { dialog, panel } = this.options
		if (!dialog || !panel) {
			return
		}
		this.setOrigin(this.currentTranslate)
		this.pinTravelSize()
		dialog.toggleAttribute('data-closing', true)
		await Promise.allSettled(panel.getAnimations().map(animation => animation.finished))
	}

	/** Resets animation attributes and custom properties after hiding. */
	reset() {
		this.options.dialog?.toggleAttribute('data-closing', false)
		this.setOrigin(undefined)
		this.offset(undefined)
	}

	/** Cancels running animations and pins the current offset as gesture start position. */
	pin() {
		const panel = this.options.panel
		if (!panel) {
			return
		}
		this.pinned = this.distanceOf(this.currentTranslate)
		panel.getAnimations().forEach(animation => animation.cancel())
		this.offset(0)
	}

	/** Offsets the panel relative to its pinned position. */
	offset(distance: number | undefined) {
		const panel = this.options.panel
		if (!panel) {
			return
		}
		if (distance === undefined) {
			this.pinned = 0
			panel.style.removeProperty('translate')
			return
		}
		const offset = `${(this.pinned + distance) * this.sign}px`
		panel.style.translate = this.options.placement.startsWith('inline') ? `${offset} 0` : `0 ${offset}`
	}

	/** Animates the panel back to its resting position. */
	async settle() {
		const panel = this.options.panel
		if (!panel) {
			return
		}
		const from = this.currentTranslate
		this.offset(undefined)
		if (!from || from === 'none') {
			return
		}
		const animation = panel.animate({ translate: [from, 'none'] }, { duration: this.duration, easing: this.easing })
		await animation.finished.catch(() => undefined)
	}

	private distanceOf(translate: string | undefined) {
		if (!translate || translate === 'none') {
			return 0
		}
		const [x, y] = translate.split(' ')
		const along = this.options.placement.startsWith('inline') ? x : y
		return (parseFloat(along ?? '') || 0) * this.sign
	}

	private get sign() {
		const { placement, panel } = this.options
		const forward = placement.endsWith('-end')
		if (!placement.startsWith('inline')) {
			return forward ? 1 : -1
		}
		const rtl = !!panel && getComputedStyle(panel).direction === 'rtl'
		return forward === !rtl ? 1 : -1
	}

	private get duration() {
		const raw = this.readProperty('--mo-sheet-duration')
		return raw.endsWith('ms') ? parseFloat(raw) : raw.endsWith('s') ? parseFloat(raw) * 1000 : 250
	}

	private get easing() {
		return this.readProperty('--mo-sheet-easing') || 'ease'
	}

	private readProperty(property: string) {
		return this.options.panel ? getComputedStyle(this.options.panel).getPropertyValue(property).trim() : ''
	}

	private get currentTranslate() {
		return this.options.panel ? getComputedStyle(this.options.panel).translate : undefined
	}

	private setOrigin(origin: string | undefined) {
		const panel = this.options.panel
		if (!panel) {
			return
		}
		if (origin === undefined) {
			panel.style.removeProperty('--mo-sheet-motion-origin')
		} else {
			panel.style.setProperty('--mo-sheet-motion-origin', origin)
		}
	}

	private pinTravelSize() {
		const panel = this.options.panel
		if (!panel) {
			return
		}
		const size = this.travelSize
		// Fall back to stylesheet relative default if unmeasurable (e.g. background tab).
		if (size > 0) {
			panel.style.setProperty('--mo-sheet-travel-size', `${size}px`)
		} else {
			panel.style.removeProperty('--mo-sheet-travel-size')
		}
	}
}