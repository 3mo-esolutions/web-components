import { Controller, css, unsafeCSS } from '@a11d/lit'
import { type Popover } from './Popover.js'
import { PopoverAlignment } from './PopoverAlignment.js'
import { PopoverPlacement } from './PopoverPlacement.js'
import { PopoverVirtualAnchor } from './PopoverVirtualAnchor.js'
import { PopoverHost } from './PopoverHost.js'

export class PopoverCssAnchorPositionController extends Controller {
	static readonly supported = CSS.supports('anchor-name: --name')

	private static getCssRoot(element: HTMLElement): HTMLElement {
		const key = 'cssRoot'
		let root: HTMLElement | undefined = (element as any)
		while (root && key in root) {
			const newRoot = (root as any)[key]
			if (newRoot) {
				if (root) {
					root.style.positionAnchor = 'inherit'
				}
			}
			root = newRoot
		}
		return root ?? element
	}

	static get styles() {
		const getPositionArea = (placement: PopoverPlacement, alignment: PopoverAlignment) => {
			const p = unsafeCSS(placement)
			const a = unsafeCSS(alignment)
			const flippedAxis = placement.includes('block') ? 'inline' : 'block'
			const tethering = unsafeCSS(
				alignment === PopoverAlignment.Center
					? 'span-all'
					: alignment === PopoverAlignment.Start
						? `span-${flippedAxis}-end`
						: `span-${flippedAxis}-start`
			)
			return css`
				:host([placement=${p}][alignment=${a}]) {
					position-area: ${p} ${tethering};
				}
			`
		}
		return !PopoverCssAnchorPositionController.supported ? css`` : css`
			${getPositionArea(PopoverPlacement.BlockStart, PopoverAlignment.Start)}
			${getPositionArea(PopoverPlacement.BlockStart, PopoverAlignment.Center)}
			${getPositionArea(PopoverPlacement.BlockStart, PopoverAlignment.End)}
			${getPositionArea(PopoverPlacement.InlineStart, PopoverAlignment.Start)}
			${getPositionArea(PopoverPlacement.InlineStart, PopoverAlignment.Center)}
			${getPositionArea(PopoverPlacement.InlineStart, PopoverAlignment.End)}
			${getPositionArea(PopoverPlacement.InlineEnd, PopoverAlignment.Start)}
			${getPositionArea(PopoverPlacement.InlineEnd, PopoverAlignment.Center)}
			${getPositionArea(PopoverPlacement.InlineEnd, PopoverAlignment.End)}
			${getPositionArea(PopoverPlacement.BlockEnd, PopoverAlignment.Start)}
			${getPositionArea(PopoverPlacement.BlockEnd, PopoverAlignment.Center)}
			${getPositionArea(PopoverPlacement.BlockEnd, PopoverAlignment.End)}

			:host {
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

	override hostUpdated() {
		if (this.host.anchor) {
			this.host.coordinates
				? this.tetherToCoordinates()
				: this.tetherTo(this.host.anchor)
		}
	}

	override hostDisconnected() {
		if (this.virtualAnchor) {
			this.virtualAnchor.remove()
			this.virtualAnchor = undefined
		}
	}

	private virtualAnchor?: PopoverVirtualAnchor
	private tetherToCoordinates() {
		const popover = this.host
		const coordinates = popover.coordinates
		this.virtualAnchor ??= new PopoverVirtualAnchor()
		this.virtualAnchor.coordinates = coordinates
		PopoverHost.get(popover.anchor!).appendChild(this.virtualAnchor)
		this.tetherTo(this.virtualAnchor)
	}

	private tetherTo(anchor = this.host.anchor) {
		const popover = this.host
		const cssRoot = PopoverCssAnchorPositionController.getCssRoot(popover)
		const positionAnchor = getComputedStyle(cssRoot).positionAnchor
		if (anchor && !(positionAnchor === 'auto' ? '' : positionAnchor)) {
			cssRoot.style.positionAnchor
				= anchor.style.anchorName
				||= `--${anchor.id || `${anchor.tagName.toLowerCase()}--${Math.random().toString(36).substring(2, 15)}`}`
		}
	}
}

declare global {
	interface CSSStyleDeclaration {
		anchorName: string
		positionAnchor: string
	}
}