import { directive, AsyncDirective, type ElementPart, HTMLTemplateResult, type PartInfo, PartType, render, html } from '@a11d/lit'
import { Tooltip } from './Tooltip.js'
import { TooltipPlacement } from './TooltipPlacement.js'
import { Application } from '@a11d/lit-application'

type TooltipDirectiveParameters = [content: string | HTMLTemplateResult, placement?: TooltipPlacement]

export class TooltipDirective extends AsyncDirective {
	private tooltip?: Tooltip

	private static breakpoint = 1024
	private static delay = 1_500

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('tooltip can only be used on an element')
		}
	}

	override async update(part: ElementPart, [content, placement]: TooltipDirectiveParameters) {
		if (this.isConnected) {
			this.tooltip ??= new Tooltip()
			this.tooltip.anchor = part.element as HTMLElement

			if (placement) {
				this.tooltip.placement = placement
			}

			if (typeof content === 'string') {
				part.element.ariaLabel = content
			}

			await new Promise(r => setTimeout(r))

			render(content, this.tooltip)

			this.tooltip.rich = this.tooltip.childElementCount > 0

			Application.topLayer.appendChild(this.tooltip)
		}

		return super.update(part, [content, placement])
	}

	render(...parameters: TooltipDirectiveParameters) {
		parameters
		return html.nothing
	}

	protected override disconnected() {
		if (window.innerWidth < TooltipDirective.breakpoint + 1) {
			setTimeout(() => this.tooltip?.remove(), TooltipDirective.delay)
		} else {
			this.tooltip?.remove()
		}
	}
}

export const tooltip = directive(TooltipDirective)