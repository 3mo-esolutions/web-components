import { directive, AsyncDirective, type ElementPart, type HTMLTemplateResult, type PartInfo, PartType, render, noChange } from '@a11d/lit'
import { type Popover } from './Popover.js'
import { PopoverHost } from './PopoverHost.js'

type PopoverDirectiveParameters = [template: () => HTMLTemplateResult]

class PopoverDirective extends AsyncDirective {
	container?: HTMLElement
	popover?: Popover
	part?: ElementPart
	template?: () => HTMLTemplateResult

	private _host?: HTMLElement
	get host() { return this._host ??= PopoverHost.get(this.part!.element as HTMLElement) }

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('The "popover" directive can only be used on an element')
		}
	}

	override update(part: ElementPart, [template]: PopoverDirectiveParameters) {
		this.part = part
		this.template = template
		if (this.isConnected) {
			requestIdleCallback(() => {
				render(template(), this.container ??= document.createElement('span'))

				if (!this.popover) {
					this.popover = this.container.firstElementChild as Popover
					this.popover.anchor = part.element as HTMLElement

					// Simulate the connectedCallback lifecycle event
					this.popover!.connectedCallback()
					this.popover!.addEventListener('openChange', this)
				}
			})
		}

		return noChange
	}

	handleEvent(event: CustomEvent<boolean>) {
		if (this.popover && !this.popover.isConnected && event.detail === true) {
			this.host.appendChild(this.popover)
		}
	}

	render(...parameters: PopoverDirectiveParameters) {
		parameters
		return noChange
	}

	// Override it to have public access to the method
	override reconnected() {
		super.reconnected()
		if (this.part && this.template) {
			this.update(this.part, [this.template])
		}
	}

	override disconnected() {
		this.popover?.removeEventListener('openChange', this)
		this.container?.remove()
		this.container = undefined
		this.popover?.remove()
		this.popover = undefined
	}
}

/** Hosts a popover tethered to the anchor element in the application top-layer lazily. */
export const popover = directive(PopoverDirective)