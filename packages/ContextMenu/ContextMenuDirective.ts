import { directive, AsyncDirective, type ElementPart, type HTMLTemplateResult, type PartInfo, PartType, render, nothing } from '@a11d/lit'
import { PopoverHost } from '@3mo/popover'
import { ContextMenu } from './ContextMenu.js'

type ContextMenuDirectiveParameters = [content: HTMLTemplateResult]

export class ContextMenuDirective extends AsyncDirective {
	private contextMenu?: ContextMenu

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('contextMenu can only be used on an element')
		}
	}

	override update(part: ElementPart, [content]: ContextMenuDirectiveParameters) {
		if (this.isConnected) {
			this.contextMenu ??= new ContextMenu()
			this.contextMenu.anchor = part.element as HTMLElement

			if (typeof content === 'string') {
				part.element.ariaLabel = content
			}

			render(content, this.contextMenu)

			PopoverHost.instance.appendChild(this.contextMenu)
		}

		return super.update(part, [content])
	}

	render(...parameters: ContextMenuDirectiveParameters) {
		parameters
		return nothing
	}

	protected override disconnected() {
		this.contextMenu?.remove()
	}
}

export const contextMenu = directive(ContextMenuDirective)