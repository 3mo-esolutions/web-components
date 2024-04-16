import { directive, AsyncDirective, PartType, type ElementPart, type PartInfo, html } from '@a11d/lit'
import { ContextMenu } from './ContextMenu.js'
import { ContextMenuLazyInitializer, type ContextMenuTemplate } from './ContextMenuLazyInitializer.js'

type ContextMenuDirectiveParameters = [content: ContextMenuTemplate]

export class ContextMenuDirective extends AsyncDirective {
	private contextMenu?: ContextMenu

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('contextMenu can only be used on an element')
		}
	}

	override update(part: ElementPart, [template]: ContextMenuDirectiveParameters) {
		if (this.isConnected && !this.contextMenu) {
			this.contextMenu = new ContextMenu()
			this.contextMenu.anchor = part.element as HTMLElement
			ContextMenuLazyInitializer.initialize(this.contextMenu, template)
		}
		return super.update(part, [template])
	}

	render(...parameters: ContextMenuDirectiveParameters) {
		parameters
		return html.nothing
	}

	protected override disconnected() {
		this.contextMenu?.remove()
	}
}

export const contextMenu = directive(ContextMenuDirective)