import { Controller } from '@a11d/lit'
import type { Radio } from './Radio.js'

/**
 * Manages document-wide radio grouping by `name` across shadow roots.
 * Unnamed radios belong to a single global unnamed group.
 */
export class RadioGroupController extends Controller {
	private static readonly radios = new Set<Radio>()

	constructor(protected override readonly host: Radio) {
		super(host)
	}

	private static groupOf(name: string): ReadonlyArray<Radio> {
		return [...RadioGroupController.radios].filter(radio => radio.name === name)
	}

	get group() {
		return RadioGroupController.groupOf(this.host.name)
	}

	override hostConnected() {
		RadioGroupController.radios.add(this.host)
		this.host.addEventListener('keydown', this)
		// Restore roving tabindex after md-radio resets its tabindex to 0 on focusout
		this.host.addEventListener('focusout', this)
		this.handleSelectedChange()
	}

	override hostDisconnected() {
		RadioGroupController.radios.delete(this.host)
		this.host.removeEventListener('keydown', this)
		this.host.removeEventListener('focusout', this)
		this.updateTabIndices()
	}

	override hostUpdated() {
		// Re-apply tabindex after md-radio's internal controller resets it on update
		RadioGroupController.applyTabIndex(this.host, this.isTabbable(this.host))
	}

	handleEvent(e: Event) {
		switch (e.type) {
			case 'keydown':
				this.handleKeyDown(e as KeyboardEvent)
				break
			case 'focusout':
				this.updateTabIndices()
				break
		}
	}

	handleSelectedChange() {
		if (!RadioGroupController.radios.has(this.host)) {
			return
		}
		if (this.host.selected) {
			for (const radio of this.group) {
				if (radio !== this.host && radio.selected) {
					radio.selected = false
					// Dispatch change event to notify bindings of deselection
					radio.change.dispatch(false)
				}
			}
		}
		this.updateTabIndices()
	}

	handleNameChange(previousName?: string) {
		if (previousName !== undefined) {
			this.updateTabIndicesOf(previousName)
		}
		this.handleSelectedChange()
	}

	private updateTabIndices() {
		this.updateTabIndicesOf(this.host.name)
	}

	private updateTabIndicesOf(name: string) {
		const group = RadioGroupController.groupOf(name)
		for (const radio of group) {
			RadioGroupController.applyTabIndex(radio, RadioGroupController.isTabbable(radio, group))
		}
	}

	private isTabbable(radio: Radio) {
		return RadioGroupController.isTabbable(radio, this.group)
	}

	// Tabbable if selected, or if nothing in the group is selected (and not disabled)
	private static isTabbable(radio: Radio, group: ReadonlyArray<Radio>) {
		return !radio.disabled && (radio.selected || !group.some(candidate => candidate.selected))
	}

	private static applyTabIndex(radio: Radio, tabbable: boolean) {
		const element = radio.renderRoot.querySelector('md-radio')
		if (element) {
			element.tabIndex = tabbable ? 0 : -1
		}
	}

	private handleKeyDown(e: KeyboardEvent) {
		const forwards = e.key === 'ArrowDown' || e.key === 'ArrowRight'
		const backwards = e.key === 'ArrowUp' || e.key === 'ArrowLeft'
		if (!forwards && !backwards) {
			return
		}
		const group = this.group
		if (group.length < 2) {
			return
		}
		e.preventDefault()
		// RTL inverts horizontal arrows, vertical arrows remain unchanged
		const horizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight'
		const rtl = horizontal && getComputedStyle(this.host).direction === 'rtl'
		const walkForwards = rtl ? !forwards : forwards
		const from = group.indexOf(this.host)
		const after = group.slice(from + 1)
		const before = group.slice(0, from)
		const order = walkForwards
			? [...after, ...before]
			: [...before.reverse(), ...after.reverse()]
		const next = order.find(radio => !radio.disabled)
		if (!next) {
			return
		}
		if (!next.selected) {
			next.selected = true
			next.change.dispatch(true)
		}
		next.focus()
	}
}