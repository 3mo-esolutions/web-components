import { HTMLTemplateResult, render } from '@a11d/lit'
import { Application } from '@a11d/lit-application'
import { ContextMenu } from './ContextMenu.js'

export type ContextMenuTemplate = HTMLTemplateResult | (() => HTMLTemplateResult)

export class ContextMenuLazyInitializer {
	static initialize(contextMenu: ContextMenu, template: ContextMenuTemplate) {
		const opener = new ContextMenuLazyInitializer(contextMenu, template)
		contextMenu.addController(opener)
		contextMenu.connectedCallback()
	}

	private preventUnsubscription = false

	protected constructor(protected readonly contextMenu: ContextMenu, protected readonly template: ContextMenuTemplate) { }

	hostConnected() {
		this.contextMenu.openChange.subscribe(this.handleOpenChange)
	}

	hostDisconnected() {
		if (this.preventUnsubscription === false) {
			this.contextMenu.openChange.unsubscribe(this.handleOpenChange)
		}
	}

	private handleOpenChange = (open: boolean) => {
		if (!this.contextMenu) {
			return
		}

		if (open) {
			const template = typeof this.template === 'function'
				? this.template()
				: this.template
			render(template, this.contextMenu)
			Application.topLayer.appendChild(this.contextMenu)
		} else {
			this.preventUnsubscription = true
			this.contextMenu.remove()
			this.preventUnsubscription = false
		}
	}
}