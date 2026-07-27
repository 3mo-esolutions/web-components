import { Controller, css, unsafeCSS, EventListenerController } from '@a11d/lit'
import { ResizeController } from '@3mo/resize-observer'
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
				--_mo-popover-tip-half: calc(var(--mo-popover-tip-size, 0) / 2);
				--_mo-popover-tip-offset: calc(var(--mo-popover-tip-size, 0) * 0.6);
			}

			:host([placement^=block]) {
				position-try: normal flip-block, flip-inline, flip-block flip-inline;
			}

			:host([placement^=inline]) {
				position-try: normal flip-inline, flip-block, flip-block flip-inline;
			}

			${PopoverCssAnchorPositionController.tipStyles}
		`
	}

	/**
	 * The tip is a single box inset \`--offset\` beyond the popover on every side, carrying one
	 * pointed cap per side in a unified clip-path and painted behind the popover (\`z-index: -1\`)
	 * in its own colour so the body hides all but the protruding cap. The popover reserves a gap
	 * toward the anchor (an inset) and a margin of \`--offset\` on the three other sides (zero on the
	 * anchor-facing side); the tip inherits that margin, which pulls the three far caps flush with
	 * the body — tucked away — and lets only the anchor-facing cap protrude into the gap, its apex
	 * meeting the anchor. Because \`position-try\` flips the inset and margins together, the exposed
	 * cap tracks the anchor across every fallback purely in CSS — no \`anchor()\` reference that would
	 * have to cross the shadow boundary. The one case CSS alone cannot cover is a popover clamped
	 * inside the viewport (its centre no longer aligns with the anchor's), which {@link updateTipShift}
	 * corrects with a measure-only nudge.
	 *
	 * Every rule is scoped to \`:host([tip])\` — the gap insets in particular would otherwise pin a
	 * plain (tip-less) popover's edge and hijack its placement. The \`tip\` attribute is opted into by
	 * consumers that render a tip (e.g. \`mo-tooltip\`); it is what turns the whole mechanism on.
	 *
	 * @see https://css-tip.com/tooltip-anchor-2/
	 */
	private static get tipStyles() {
		return css`
			:host([tip][placement=block-start]) { inset-block-end: var(--_mo-popover-tip-offset); margin: var(--_mo-popover-tip-offset); margin-block-end: 0; }
			:host([tip][placement=block-end]) { inset-block-start: var(--_mo-popover-tip-offset); margin: var(--_mo-popover-tip-offset); margin-block-start: 0; }
			:host([tip][placement=inline-start]) { inset-inline-end: var(--_mo-popover-tip-offset); margin: var(--_mo-popover-tip-offset); margin-inline-end: 0; }
			:host([tip][placement=inline-end]) { inset-inline-start: var(--_mo-popover-tip-offset); margin: var(--_mo-popover-tip-offset); margin-inline-start: 0; }

			/*
			 * The cap normally sits at the cross-axis centre (50%). When the popover is clamped
			 * inside the viewport it no longer shares its centre with the anchor, so the controller
			 * measures that offset and feeds it back as \`--_mo-popover-tip-shift-{x,y}\` (one per
			 * cross-axis, clamped to keep the cap attached to the body), sliding the exposed cap
			 * back onto the anchor. This is the sole concession to scripting — the popover itself is
			 * still positioned entirely by the browser's native anchor positioning.
			 */
			:host([tip]) [part=arrow] {
				position: absolute;
				inset: calc(-1 * var(--_mo-popover-tip-offset));
				margin: inherit;
				clip-path: polygon(
					calc(50% - var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-x, 0px)) var(--_mo-popover-tip-offset), calc(50% + var(--_mo-popover-tip-shift-x, 0px)) 1px, calc(50% + var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-x, 0px)) var(--_mo-popover-tip-offset),
					calc(100% - var(--_mo-popover-tip-offset)) calc(50% - var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-y, 0px)), calc(100% - 1px) calc(50% + var(--_mo-popover-tip-shift-y, 0px)), calc(100% - var(--_mo-popover-tip-offset)) calc(50% + var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-y, 0px)),
					calc(50% + var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-x, 0px)) calc(100% - var(--_mo-popover-tip-offset)), calc(50% + var(--_mo-popover-tip-shift-x, 0px)) calc(100% - 1px), calc(50% - var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-x, 0px)) calc(100% - var(--_mo-popover-tip-offset)),
					var(--_mo-popover-tip-offset) calc(50% + var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-y, 0px)), 1px calc(50% + var(--_mo-popover-tip-shift-y, 0px)), var(--_mo-popover-tip-offset) calc(50% - var(--_mo-popover-tip-half) + var(--_mo-popover-tip-shift-y, 0px))
				);
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
		this.updateTipShift()
	}

	override hostDisconnected() {
		this.virtualAnchor?.remove()
		this.virtualAnchor = undefined
	}

	// The native anchor positioning keeps the popover glued to the anchor without scripting, but it
	// cannot expose the anchor's box to the tip across the shadow boundary. These listeners re-run the
	// (cheap, measure-only) tip-shift calculation whenever the popover's position relative to the anchor
	// can change — they never reposition the popover itself.
	protected readonly resizeController = new ResizeController(this.host, {
		callback: () => this.updateTipShift(),
	})

	protected readonly scrollListener = new EventListenerController(this.host, {
		target: window,
		type: 'scroll',
		options: { capture: true, passive: true },
		listener: () => this.updateTipShift(),
	})

	/**
	 * Slides the exposed tip cap back onto the anchor when the popover has been clamped away from it.
	 * Measures the anchor↔popover offset on the cross-axis and clamps it so the cap stays attached to
	 * the body, then publishes it as a custom property the clip-path consumes. Skipped (and cleared)
	 * for closed, anchorless or tip-less popovers — a tip-less popover sits flush against its anchor,
	 * so the absence of a gap is what marks it as having no tip.
	 */
	protected updateTipShift() {
		const host = this.host
		const anchor = host.anchor
		const clear = () => {
			host.style.removeProperty('--_mo-popover-tip-shift-x')
			host.style.removeProperty('--_mo-popover-tip-shift-y')
		}
		if (!host.open || !anchor || host.coordinates || !host.hasAttribute('tip')) {
			return clear()
		}

		const a = anchor.getBoundingClientRect()
		const h = host.getBoundingClientRect()
		const block = host.placement.startsWith('block')

		// The gap on the placement axis equals the tip's protrusion; zero means no tip is rendered.
		const gap = block
			? (h.top >= a.bottom ? h.top - a.bottom : a.top - h.bottom)
			: (h.left >= a.right ? h.left - a.right : a.left - h.right)
		if (gap < 1) {
			return clear()
		}

		const anchorCenter = block ? (a.left + a.right) / 2 : (a.top + a.bottom) / 2
		const hostCenter = block ? (h.left + h.right) / 2 : (h.top + h.bottom) / 2
		const crossSize = block ? h.width : h.height
		// The tip base is `gap / 0.6` wide (offset = 0.6 × size); keep it — plus a hair — inside the body.
		const limit = Math.max(0, crossSize / 2 - gap / 1.2 - 2)
		const shift = Math.max(-limit, Math.min(limit, anchorCenter - hostCenter))

		clear()
		host.style.setProperty(`--_mo-popover-tip-shift-${block ? 'x' : 'y'}`, `${shift}px`)
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