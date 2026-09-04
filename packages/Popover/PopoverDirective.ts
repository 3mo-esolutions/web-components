import { directive, AsyncDirective, type ElementPart, type HTMLTemplateResult, type PartInfo, PartType, render, noChange } from '@a11d/lit'
import { type Popover } from './Popover.js'
import { PopoverHost } from './PopoverHost.js'

/**
 * The interaction which materializes and opens the popover:
 * - `click`: a click on the anchor, or an "Enter" key-down while the anchor is focused.
 * - `contextmenu`: a context-menu interaction on the anchor (right-click, long-press, or the context-menu key).
 * - `interest`: hover or keyboard-focus of the anchor, or a held press on touch devices (e.g. tooltips).
 */
export type PopoverTrigger = 'click' | 'contextmenu' | 'interest'

export interface PopoverDirectiveOptions {
	/**
	 * Renders the popover lazily: nothing exists until this interaction first happens on the anchor, after
	 * which the popover handles its own triggering and stays cached. Omitted, the template renders
	 * eagerly at idle time as before, for popovers with custom trigger semantics.
	 */
	trigger?: PopoverTrigger
	/** An accessible label applied to the anchor immediately, i.e. even before materialization. */
	label?: string
}

type PopoverDirectiveParameters = [template: () => HTMLTemplateResult, options?: PopoverDirectiveOptions]

class PopoverDirective extends AsyncDirective {
	host?: HTMLElement
	container?: HTMLElement
	popover?: Popover
	part?: ElementPart
	template?: () => HTMLTemplateResult
	options?: PopoverDirectiveOptions
	popoverOpen = false
	idleCallbackHandle?: number

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('The "popover" directive can only be used on an element')
		}
	}

	get anchor() { return this.part?.element as HTMLElement | undefined }

	override update(part: ElementPart, [template, options]: PopoverDirectiveParameters) {
		this.part = part
		this.template = template
		// Refreshed every render, so a re-localized label keeps naming the anchor before materialization
		this.options = options ?? this.options
		if (this.isConnected) {
			if (!this.options?.trigger) {
				this.eagerUpdate()
			} else {
				this.lazyUpdate()
			}
		}

		return noChange
	}

	lazyUpdate() {
		if (this.options?.label !== undefined && !this.popover) {
			this.anchor?.setAttribute('aria-label', this.options.label)
		}

		if (!this.popover) {
			this.addTriggerListeners()
		} else if (this.popoverOpen) {
			// Keep the content of an open popover fresh across host re-renders
			render(this.template!(), this.container!)
		}
	}

	triggerListenersAttached = false
	get triggerEventTypes(): Array<string> {
		switch (this.options?.trigger) {
			case 'click': return ['click', 'keydown']
			case 'contextmenu': return ['contextmenu']
			case 'interest': return ['pointerenter', 'pointerdown', 'focusin']
			default: return []
		}
	}

	addTriggerListeners() {
		if (!this.triggerListenersAttached && this.anchor) {
			this.triggerListenersAttached = true
			for (const type of this.triggerEventTypes) {
				this.anchor.addEventListener(type, this)
			}
		}
	}

	removeTriggerListeners() {
		if (this.triggerListenersAttached && this.anchor) {
			this.triggerListenersAttached = false
			for (const type of this.triggerEventTypes) {
				this.anchor.removeEventListener(type, this)
			}
		}
	}

	handleEvent(event: Event) {
		if (event.type === 'openChange') {
			this.handleOpenChange(event as CustomEvent<boolean>)
			return
		}

		if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Enter') {
			return
		}

		const popover = this.popover ?? this.materialize()

		if (popover) {
			// The materialized popover takes over its own triggering from here
			this.removeTriggerListeners()
			this.openMaterialized(popover, event)
		}
	}

	materialize() {
		if (!this.template || !this.anchor) {
			return undefined
		}
		render(this.template(), this.container ??= document.createElement('span'))
		const popover = this.container.firstElementChild as Popover
		popover.anchor = this.anchor
		popover.addEventListener('openChange', this)
		PopoverHost.get(this.anchor).appendChild(popover)
		this.popover = popover
		return popover
	}

	openMaterialized(popover: Popover, event: Event) {
		const p = popover as Popover & { openWith?(e: Event): void, setOpen?(open: boolean): void }
		switch (this.options?.trigger) {
			case 'contextmenu':
				event.preventDefault()
				if (typeof p.openWith === 'function') {
					p.openWith(event)
				} else {
					p.open = true
				}
				break
			case 'click':
				if (event.type === 'keydown') {
					event.preventDefault()
				}
				// The very interaction opening the popover must not dismiss it again on its way up
				p.consumeInteraction(event)
				if (typeof p.setOpen === 'function') {
					p.setOpen(true)
				} else {
					p.open = true
				}
				break
			case 'interest': {
				// Hands the missed initiating event over, deferred until the popover's listeners have subscribed
				const clone = new (event.constructor as typeof Event)(event.type, event)
				setTimeout(() => this.anchor?.dispatchEvent(clone))
				break
			}
		}
	}

	handleOpenChange(event: CustomEvent<boolean>) {
		this.popoverOpen = event.detail === true
		if (this.popoverOpen && this.popover) {
			render(this.template!(), this.container!)
			if (!this.popover.isConnected && this.anchor) {
				this.host ??= PopoverHost.get(this.anchor)
				this.host.appendChild(this.popover)
			}
		}
	}

	eagerUpdate() {
		if (this.idleCallbackHandle !== undefined) {
			cancelIdleCallback(this.idleCallbackHandle)
		}
		this.idleCallbackHandle = requestIdleCallback(() => {
			this.idleCallbackHandle = undefined
			if (!this.isConnected || !this.template) {
				return
			}
			render(this.template(), this.container ??= document.createElement('span'))

			if (!this.popover) {
				this.popover = this.container.firstElementChild as Popover
				this.popover.anchor = this.anchor as HTMLElement

				// Simulate the connectedCallback lifecycle event
				this.popover!.connectedCallback()
				this.popover!.addEventListener('openChange', this)
			}
		})
	}

	render(...parameters: PopoverDirectiveParameters) {
		parameters
		return noChange
	}

	// Override it to have public access to the method
	override reconnected() {
		super.reconnected()
		if (this.part && this.template) {
			this.update(this.part, [this.template, this.options])
		}
	}

	override disconnected() {
		if (this.idleCallbackHandle !== undefined) {
			cancelIdleCallback(this.idleCallbackHandle)
			this.idleCallbackHandle = undefined
		}
		this.removeTriggerListeners()
		this.popover?.removeEventListener('openChange', this)
		this.container?.remove()
		this.container = undefined
		this.popover?.remove()
		this.popover = undefined
		this.popoverOpen = false
	}
}

/** Hosts a popover tethered to the anchor element in the application top-layer lazily. */
export const popover = directive(PopoverDirective)