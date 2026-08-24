import { Component, component, css, event, html, isServer, property, repeat } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'

/**
 * A container which holds several pieces of content and transitions between them, showing only one at a time.
 *
 * It is meant for content which is small enough to share a single box, such as the icon of a button, a short
 * label or a status chip, as all slots occupy the same grid cell and the swap therefore takes the size of its
 * largest one. This is what keeps a swap from resizing while it transitions. Switching between whole views is
 * the job of a tab or a router instead.
 *
 * @element mo-swap
 *
 * @attr value - The name of the slot which is shown. Empty, which is the default, shows the default slot.
 * @attr flashDuration - The milliseconds a value flashed through "flash()" is shown before the previous one is restored.
 *
 * @slot - Shown as long as "value" is empty.
 * @slot [name] - Shown while "value" is the name of the slot. Setting "value" to "success" shows "slot=success".
 *
 * @cssprop --mo-swap-transition-duration - The duration of the transition between two values. Defaults to "250ms".
 * @cssprop --mo-swap-transition-easing - The easing of the transition between two values.
 * @cssprop --mo-swap-inactive-opacity - The opacity of the slots which are not shown. Defaults to "0".
 * @cssprop --mo-swap-inactive-transform - The transform of the slots which are not shown. Defaults to a slight scale down.
 *
 * @fires change - Dispatched with the new value whenever another slot is shown.
 */
@component('mo-swap')
export class Swap extends Component {
	@event() readonly change!: EventDispatcher<string>

	@property({
		reflect: true,
		bindingDefault: true,
		event: 'change',
		updated(this: Swap, value: string, previousValue: string | undefined) {
			// A value set from anywhere but the pending flash is a deliberate override and thus revokes its revert.
			if (this.pendingFlash && this.pendingFlash.value !== value) {
				this.pendingFlash = undefined
			}
			if (previousValue !== undefined && previousValue !== value) {
				this.change.dispatch(value)
			}
		}
	}) value = ''

	@property({ type: Number }) flashDuration = 1500

	protected readonly slotController = new SlotController(this)

	/**
	 * Every value the swap can take, being the empty one of the default slot and the "slot" of each child.
	 * The current value is always among them, so that content assigned to it after the fact appears without
	 * another update.
	 */
	get values() {
		const slottedValues = isServer ? [] : [...this.children].map(child => child.slot)
		return [...new Set(['', ...slottedValues, this.value])]
	}

	private pendingFlash?: { readonly value: string, readonly revertValue: string, readonly token: symbol }

	/**
	 * Shows a value and restores the one preceding it afterwards. Calling it again while a flash is pending
	 * prolongs it, so that repeated flashes do not fall back to a value which is on its way out.
	 */
	async flash(value: string, duration = this.flashDuration) {
		const revertValue = this.pendingFlash?.revertValue ?? this.value
		const token = Symbol('flash')
		this.pendingFlash = { value, revertValue, token }
		this.value = value
		await new Promise(resolve => setTimeout(resolve, duration))
		if (this.pendingFlash?.token === token) {
			this.pendingFlash = undefined
			this.value = revertValue
		}
	}

	static override get styles() {
		return css`
			:host {
				display: inline-grid;
				place-items: center;
			}

			[data-value] {
				--_transition: var(--mo-swap-transition-duration, 250ms) var(--mo-swap-transition-easing, cubic-bezier(0.2, 0, 0, 1));
				/* All slots share one cell, which sizes the swap to its largest one and keeps it from resizing mid-transition. */
				grid-area: 1 / 1;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				transition: opacity var(--_transition), transform var(--_transition), visibility 0s;

				@media (prefers-reduced-motion: reduce) {
					transition: none;
				}

				&:not([data-active]) {
					opacity: var(--mo-swap-inactive-opacity, 0);
					transform: var(--mo-swap-inactive-transform, scale(0.6));
					pointer-events: none;
					/*
						Hiding keeps a slot which is not shown out of the accessibility tree, but only once it has
						faded out, as "visibility" would otherwise switch halfway through the transition.
					*/
					visibility: hidden;
					transition: opacity var(--_transition), transform var(--_transition), visibility 0s var(--mo-swap-transition-duration, 250ms);
				}
			}
		`
	}

	protected override get template() {
		return html`
			${repeat(this.values, value => value, value => html`
				<div data-value=${value} ?data-active=${value === this.value}>
					${!value ? html`<slot></slot>` : html`<slot name=${value}></slot>`}
				</div>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-swap': Swap
	}
}