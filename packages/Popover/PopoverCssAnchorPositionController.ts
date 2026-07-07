import { Controller, css, unsafeCSS } from '@a11d/lit'
import { type Popover } from './Popover.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverVirtualAnchor } from './PopoverVirtualAnchor.js'
import { PopoverHost } from './PopoverHost.js'

export class PopoverCssAnchorPositionController extends Controller {
	/**
	 * Tethering is based on the implicit anchor established via `showPopover({ source })`
	 * rather than `anchor-name` matching: since Chromium 144, `anchor-name` references are
	 * tree-scoped per the CSS Scoping specification and no longer match across shadow boundaries,
	 * while the implicit anchor is a direct element association that is not subject to name scoping
	 * and therefore tethers popovers to anchors living in any tree.
	 *
	 * The popover defaults to `position-anchor: auto` which resolves to the implicit anchor, while
	 * explicit author declarations (e.g. `position-anchor: --some-anchor`) naturally take precedence
	 * through the cascade.
	 *
	 * Implicit anchors via `source` are supported by Chromium 133+, Firefox 147+ and Safari 26+.
	 * Support is probed at runtime rather than feature-detected to also rule out partial
	 * implementations, falling back to the Floating UI controller otherwise: the probe tethers
	 * a popover to an anchor across a shadow boundary and asserts the resulting layout, thereby
	 * exercising the `source` option, `position-anchor` and `position-area` all at once.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover#source
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor
	 */
	static get supported() {
		return PopoverCssAnchorPositionController.implicitAnchorSupported ??= PopoverCssAnchorPositionController.probeImplicitAnchor()
	}

	private static implicitAnchorSupported?: boolean

	private static probeImplicitAnchor() {
		const anchor = document.createElement('div')
		anchor.style.cssText = 'position: fixed; left: 0px; top: 0px; width: 10px; height: 10px; visibility: hidden;'
		const host = document.createElement('div')
		const popover = document.createElement('div')
		popover.setAttribute('popover', 'manual')
		popover.style.cssText = 'position: fixed; width: 10px; height: 10px; margin: 0px; padding: 0px; border: none; visibility: hidden; position-anchor: auto; position-area: bottom right;'
		host.attachShadow({ mode: 'open' }).appendChild(popover)
		const root = document.body ?? document.documentElement
		root.append(anchor, host)
		try {
			popover.showPopover({ source: anchor })
			const { left, top } = popover.getBoundingClientRect()
			return Math.abs(left - 10) < 1 && Math.abs(top - 10) < 1
		} catch {
			return false
		} finally {
			anchor.remove()
			host.remove()
		}
	}

	static get styles() {
		const getPositionArea = (placement: PopoverPlacement, alignment: PopoverAlignment) => {
			const flippedAxis = placement.includes('block') ? 'inline' : 'block'
			const tethering = alignment === PopoverAlignment.Center
				? 'span-all'
				: alignment === PopoverAlignment.Start
					? `span-${flippedAxis}-end`
					: `span-${flippedAxis}-start`
			return `
				:host([placement=${placement}][alignment=${alignment}]) {
					position-area: ${placement} ${tethering};
				}
			`
		}
		return !PopoverCssAnchorPositionController.supported ? css`` : css`
			${unsafeCSS(Object.values(PopoverPlacement).flatMap(placement => Object.values(PopoverAlignment).map(alignment => getPositionArea(placement, alignment))).join(''))}

			:host {
				position-anchor: auto;
				position-visibility: always;
			}

			:host([placement^=block]) {
				position-try: normal flip-block, flip-inline, flip-block flip-inline;
			}

			:host([placement^=inline]) {
				position-try: normal flip-inline, flip-block, flip-block flip-inline;
			}
		`
	}

	constructor(protected override readonly host: Popover) {
		super(host)
	}

	/** The element the popover shall tether to, serving as the `source` of the implicit anchor. */
	get anchorElement() {
		return !this.host.coordinates ? this.host.anchor : this.requireVirtualAnchor()
	}

	override hostUpdated() {
		if (this.host.coordinates) {
			// Keep the virtual anchor's coordinates in sync while the popover stays open
			this.requireVirtualAnchor()
		}
	}

	override hostDisconnected() {
		this.virtualAnchor?.remove()
		this.virtualAnchor = undefined
	}

	private virtualAnchor?: PopoverVirtualAnchor
	private requireVirtualAnchor() {
		this.virtualAnchor ??= new PopoverVirtualAnchor()
		this.virtualAnchor.coordinates = this.host.coordinates
		if (this.virtualAnchor.isConnected === false) {
			PopoverHost.get(this.host.anchor ?? this.host).appendChild(this.virtualAnchor)
		}
		return this.virtualAnchor
	}
}