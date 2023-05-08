import { directive, AsyncDirective, type ElementPart, type HTMLTemplateResult, type PartInfo, PartType, render, nothing } from '@a11d/lit'
import { Tooltip } from './Tooltip.js'
import { TooltipPlacement } from './TooltipPlacement.js'
import { PopoverHost } from '@3mo/popover'

type TooltipDirectiveParameters = [content: string | HTMLTemplateResult, placement?: TooltipPlacement]

export class TooltipDirective extends AsyncDirective {
	private tooltip?: Tooltip

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('tooltip can only be used on an element')
		}
	}

	override update(part: ElementPart, [content, placement]: TooltipDirectiveParameters) {
		if (this.isConnected) {
			this.tooltip ??= new Tooltip()
			this.tooltip.anchor = part.element as HTMLElement

			if (placement) {
				this.tooltip.placement = placement
			}

			if (typeof content === 'string') {
				part.element.ariaLabel = content
			}

			render(content, this.tooltip)

			PopoverHost.instance.appendChild(this.tooltip)
		}

		return super.update(part, [content, placement])
	}

	render(...parameters: TooltipDirectiveParameters) {
		parameters
		return nothing
	}

	protected override disconnected() {
		this.tooltip?.remove()
	}
}

export const tooltip = directive(TooltipDirective)