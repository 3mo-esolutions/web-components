import { directive, AsyncDirective, ElementPart, HTMLTemplateResult, PartInfo, PartType, render, nothing } from '@a11d/lit'
import { Tooltip, TooltipPosition } from './Tooltip.js'
import { TooltipHost } from './TooltipHost.js'

type TooltipDirectiveParameters = [content: string | HTMLTemplateResult, position?: TooltipPosition]

export class TooltipDirective extends AsyncDirective {
	private tooltip?: Tooltip

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('tooltip can only be used on an element')
		}
	}

	override update(part: ElementPart, [content, position]: TooltipDirectiveParameters) {
		if (this.isConnected) {
			this.tooltip ??= new Tooltip(part.element)
			if (position) {
				this.tooltip.position = position
			}

			if (typeof content === 'string') {
				part.element.ariaLabel = content
			}

			render(content, this.tooltip)

			TooltipHost.instance.appendChild(this.tooltip)
		}

		return super.update(part, [content, position])
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